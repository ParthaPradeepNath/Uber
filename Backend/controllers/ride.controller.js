const rideService = require('../services/ride.service');
const mapsService = require('../services/maps.service');
const rideModel = require('../models/ride.model');
const { validationResult } = require('express-validator');

module.exports.getFare = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupAddress, destinationAddress } = req.body;

    const fareResponse = await rideService.getFare({ pickupAddress, destinationAddress });

    res.status(200).json(fareResponse);
};

module.exports.createRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupAddress, destinationAddress, vehicleType } = req.body;

    const fareResponse = await rideService.getFare({ pickupAddress, destinationAddress });

    const { distance, duration, pickup, destination } = fareResponse;
    const fare = mapsService.calculateFare(distance, duration, vehicleType);

    const ride = await rideService.createRide({
        user: req.user._id,
        pickup,
        destination,
        pickupAddress,
        destinationAddress,
        vehicleType,
        distance,
        duration,
        fare,
    });

    const availableCaptains = await rideService.findAvailableCaptains(pickup, vehicleType);

    res.status(201).json({
        ride,
        availableCaptains,
    });
};

module.exports.confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.confirmRide({
        rideId,
        captainId: req.captain._id,
    });

    res.status(201).json({ ride });
};

module.exports.getRideStatus = async (req, res, next) => {
    const { rideId } = req.params;

    const ride = await rideService.getRideById(rideId);

    if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json({ ride });
};

module.exports.startRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.body;

    const storedRide = await rideModel.findById(rideId);

    if (!storedRide) {
        return res.status(404).json({ message: 'Ride not found' });
    }

    if (storedRide.otp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
    }

    const ride = await rideService.updateRideStatus({
        rideId,
        status: 'in-progress',
        captainId: req.captain._id,
    });

    res.status(200).json({ ride });
};

module.exports.completeRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.updateRideStatus({
        rideId,
        status: 'completed',
        captainId: req.captain._id,
    });

    res.status(200).json({ ride });
};

module.exports.cancelRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.cancelRide({ rideId, user: req.user });

    res.status(200).json({ ride });
};

module.exports.getRideHistory = async (req, res, next) => {
    const rides = await rideService.getRidesByUser(req.user._id);

    res.status(200).json({ rides });
};
