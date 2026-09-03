import express from 'express';
import { body } from 'express-validator';
import {
    registerCaptain,
    loginCaptain,
    getCaptainProfile,
    logoutCaptain,
    toggleCaptainStatus,
    updateCaptainLocation,
} from '../controllers/captain.controller.js';
import { authCaptain } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Invalid Email'),
        body('fullname.firstname')
            .isLength({ min: 3 })
            .withMessage('First name must be at least 3 characters long'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('vehicle.color')
            .isLength({ min: 3 })
            .withMessage('Color must be at least 3 characters long'),
        body('vehicle.plate')
            .isLength({ min: 3 })
            .withMessage('Plate must be at least 3 characters long'),
        body('vehicle.capacity').isNumeric().withMessage('Capacity must be a number'),
        body('vehicle.vehicleType')
            .isIn(['car', 'motorcycle', 'auto'])
            .withMessage('Vehicle type must be car, motorcycle or auto'),
    ],
    registerCaptain,
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Invalid Email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
    ],
    loginCaptain,
);

router.get('/profile', authCaptain, getCaptainProfile);

router.get('/logout', authCaptain, logoutCaptain);

router.patch('/toggle-status', authCaptain, toggleCaptainStatus);

router.patch(
    '/update-location',
    [
        authCaptain,
        body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
        body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    ],
    updateCaptainLocation,
);

export default router;
