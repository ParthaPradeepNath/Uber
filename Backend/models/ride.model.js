import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'captain',
        },
        pickup: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        pickupAddress: {
            type: String,
            required: true,
        },
        destination: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        destinationAddress: {
            type: String,
            required: true,
        },
        distance: {
            type: Number,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        vehicleType: {
            type: String,
            enum: ['car', 'motorcycle', 'auto'],
            required: true,
        },
        fare: {
            type: Number,
            required: true,
        },
        otp: {
            type: String,
            select: false,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'arriving', 'in-progress', 'completed', 'cancelled'],
            default: 'pending',
        },
        payment: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        acceptedAt: {
            type: Date,
        },
        startedAt: {
            type: Date,
        },
        completedAt: {
            type: Date,
        },
        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

rideSchema.index({ pickup: '2dsphere' });
rideSchema.index({ destination: '2dsphere' });

const rideModel = mongoose.model('Ride', rideSchema);

export default rideModel;
