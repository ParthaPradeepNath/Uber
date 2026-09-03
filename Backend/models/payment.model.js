const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        ride: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ride',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        captain: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'captain',
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'upi'],
            default: 'cash',
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending',
        },
        paidAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

const paymentModel = mongoose.model('Payment', paymentSchema);

module.exports = paymentModel;
