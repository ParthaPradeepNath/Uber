const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get(
    '/fare',
    [
        authMiddleware.authUser,
        body('pickupAddress').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        body('destinationAddress')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Invalid destination address'),
    ],
    rideController.getFare,
);

router.post(
    '/create',
    [
        authMiddleware.authUser,
        body('pickupAddress').isString().isLength({ min: 3 }).withMessage('Invalid pickup address'),
        body('destinationAddress')
            .isString()
            .isLength({ min: 3 })
            .withMessage('Invalid destination address'),
        body('vehicleType').isIn(['car', 'auto', 'motorcycle']).withMessage('Invalid vehicle type'),
    ],
    rideController.createRide,
);

router.post(
    '/confirm',
    [authMiddleware.authCaptain, body('rideId').isMongoId().withMessage('Invalid ride id')],
    rideController.confirmRide,
);

router.get('/:rideId', authMiddleware.authUser, rideController.getRideStatus);

router.post(
    '/start',
    [
        authMiddleware.authCaptain,
        body('rideId').isMongoId().withMessage('Invalid ride id'),
        body('otp').isLength({ min: 4, max: 4 }).withMessage('Invalid OTP'),
    ],
    rideController.startRide,
);

router.post(
    '/complete',
    [authMiddleware.authCaptain, body('rideId').isMongoId().withMessage('Invalid ride id')],
    rideController.completeRide,
);

router.post(
    '/cancel',
    [authMiddleware.authUser, body('rideId').isMongoId().withMessage('Invalid ride id')],
    rideController.cancelRide,
);

router.get('/history', authMiddleware.authUser, rideController.getRideHistory);

module.exports = router;
