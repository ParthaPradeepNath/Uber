import userModel from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import BlacklistTokenModel from '../models/blacklistToken.model.js';
import captainModel from '../models/captain.model.js';

export const authUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await BlacklistTokenModel.findOne({ token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

export const authCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const isBlacklisted = await BlacklistTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded._id);

        req.captain = captain;

        if (!req.captain) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
