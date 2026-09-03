const rideModel = require('../models/ride.model');
const captainModel = require('../models/captain.model');
const mapsService = require('./maps.service');

const createRide = async ({
    user,
    pickup,
    destination,
    pickupAddress,
    destinationAddress,
    vehicleType,
    distance,
    duration,
    fare,
}) => {
    if (!user || !pickup || !destination || !pickupAddress || !destinationAddress) {
        throw new Error('All fields are required');
    }

    const otp = generateOtp();

    const ride = await rideModel.create({
        user,
        pickup: {
            type: 'Point',
            coordinates: [ pickup.longitude, pickup.latitude ],
        },
        destination: {
            type: 'Point',
            coordinates: [ destination.longitude, destination.latitude ],
        },
        pickupAddress,
        destinationAddress,
        vehicleType,
        distance,
        duration,
        fare,
        otp,
    });

    return ride;
};

const getFare = async ({ pickupAddress, destinationAddress }) => {
    const [ pickup, destination ] = await Promise.all([
        mapsService.getCoordinatesFromAddress(pickupAddress),
        mapsService.getCoordinatesFromAddress(destinationAddress),
    ]);

    const { distance, duration } = await mapsService.getDistanceAndDuration(pickup, destination);

    return {
        distance,
        duration,
        fares: {
            car: {
                fare: mapsService.calculateFare(distance, duration, 'car'),
            },
            auto: {
                fare: mapsService.calculateFare(distance, duration, 'auto'),
            },
            motorcycle: {
                fare: mapsService.calculateFare(distance, duration, 'motorcycle'),
            },
        },
        pickup,
        destination,
    };
};

const findAvailableCaptains = async (pickup, vehicleType, radiusKm = 10) => {
    const maxDistance = radiusKm / 6378.1;

    const captains = await captainModel.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [ pickup.longitude, pickup.latitude ],
                },
                distanceField: 'distance',
                maxDistance: maxDistance * 6378.1 * 1000,
                spherical: true,
            },
        },
        {
            $match: {
                status: 'active',
                'vehicle.vehicleType': vehicleType,
            },
        },
        {
            $limit: 10,
        },
    ]);

    return captains;
};

const confirmRide = async ({ rideId, captainId }) => {
    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.status !== 'pending') {
        throw new Error('Ride is no longer pending');
    }

    ride.captain = captainId;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();

    return ride;
};

const getRideById = async (rideId) => {
    return await rideModel.findById(rideId).populate('user').populate('captain');
};

const updateRideStatus = async ({ rideId, status, captainId }) => {
    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.captain.toString() !== captainId.toString()) {
        throw new Error('Only the assigned captain can update this ride');
    }

    ride.status = status;

    if (status === 'in-progress') {
        ride.startedAt = new Date();
    }

    if (status === 'completed') {
        ride.completedAt = new Date();
        ride.payment = 'completed';
    }

    await ride.save();
    return ride;
};

const cancelRide = async ({ rideId, user }) => {
    const ride = await rideModel.findById(rideId);

    if (!ride) {
        throw new Error('Ride not found');
    }

    if (ride.user.toString() !== user._id.toString()) {
        throw new Error('Only the ride owner can cancel this ride');
    }

    if ([ 'accepted', 'in-progress', 'completed' ].includes(ride.status)) {
        throw new Error('Ride cannot be cancelled at this stage');
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    await ride.save();

    return ride;
};

const getRidesByUser = async (userId) => {
    return await rideModel
        .find({ user: userId })
        .populate('captain')
        .sort({ createdAt: -1 });
};

const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = {
    createRide,
    getFare,
    findAvailableCaptains,
    confirmRide,
    getRideById,
    updateRideStatus,
    cancelRide,
    getRidesByUser,
};
