import * as rideService from '../services/ride.service.js';
import * as mapsService from '../services/maps.service.js';
import rideModel from '../models/ride.model.js';
import { broadcastToCaptains, sendToUser } from '../services/socket.service.js';
import { validationResult } from 'express-validator';

export const getFare = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { pickupAddress, destinationAddress } = req.body;

    const fareResponse = await rideService.getFare({ pickupAddress, destinationAddress });

    res.status(200).json(fareResponse);
};

export const createRide = async (req, res, next) => {
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

    broadcastToCaptains('ride-request', {
        ride: {
            _id: ride._id,
            pickupAddress,
            destinationAddress,
            distance,
            duration,
            fare,
            vehicleType,
        },
    });

    res.status(201).json({
        ride,
    });
};

export const confirmRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.confirmRide({
        rideId,
        captainId: req.captain._id,
    });

    sendToUser(
        'ride-accepted',
        {
            ride: {
                _id: ride._id,
                status: ride.status,
                captain: {
                    _id: req.captain._id,
                    fullname: req.captain.fullname,
                    vehicle: req.captain.vehicle,
                },
            },
        },
        ride.user.toString(),
    );

    res.status(201).json({ ride });
};

export const getRideStatus = async (req, res, next) => {
    const { rideId } = req.params;

    const ride = await rideService.getRideById(rideId);

    if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
    }

    res.status(200).json({ ride });
};

export const startRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.body;

    const storedRide = await rideModel.findById(rideId).select('+otp');

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

    sendToUser(
        'ride-started',
        {
            ride: {
                _id: ride._id,
                status: ride.status,
            },
        },
        ride.user.toString(),
    );

    res.status(200).json({ ride });
};

export const completeRide = async (req, res, next) => {
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

    sendToUser(
        'ride-completed',
        {
            ride: {
                _id: ride._id,
                status: ride.status,
                fare: ride.fare,
                payment: ride.payment,
            },
        },
        ride.user.toString(),
    );

    res.status(200).json({ ride });
};

export const cancelRide = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    const ride = await rideService.cancelRide({ rideId, user: req.user });

    res.status(200).json({ ride });
};

export const getRideHistory = async (req, res, next) => {
    const rides = await rideService.getRidesByUser(req.user._id);

    res.status(200).json({ rides });
};
