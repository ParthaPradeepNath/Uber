import express from 'express';
import { body } from 'express-validator';
import {
    getFare,
    createRide,
    confirmRide,
    getRideStatus,
    startRide,
    completeRide,
    cancelRide,
    getRideHistory,
} from '../controllers/ride.controller.js';
import { authUser, authCaptain } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
    '/fare',
    [
        authUser,
        body('pickupAddress').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        body('destinationAddress')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Invalid destination address'),
    ],
    getFare,
);

router.post(
    '/create',
    [
        authUser,
        body('pickupAddress').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        body('destinationAddress')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Invalid destination address'),
        body('vehicleType').isIn(['car', 'auto', 'motorcycle']).withMessage('Invalid vehicle type'),
    ],
    createRide,
);

router.post(
    '/confirm',
    [authCaptain, body('rideId').isMongoId().withMessage('Invalid ride id')],
    confirmRide,
);

router.get('/:rideId', authUser, getRideStatus);

router.post(
    '/start',
    [
        authCaptain,
        body('rideId').isMongoId().withMessage('Invalid ride id'),
        body('otp').isLength({ min: 4, max: 4 }).withMessage('Invalid OTP'),
    ],
    startRide,
);

router.post(
    '/complete',
    [authCaptain, body('rideId').isMongoId().withMessage('Invalid ride id')],
    completeRide,
);

router.post(
    '/cancel',
    [authUser, body('rideId').isMongoId().withMessage('Invalid ride id')],
    cancelRide,
);

router.get('/history', authUser, getRideHistory);

export default router;
