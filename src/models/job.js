const mongoose = require('mongoose');

const jobsSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    question: { type: String, required: true, trim: true },
    correctAnswer: { type: String, required: true, trim: true },
    rewardAmount: { type: Number, required: true, min: 0 },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('jobs', jobsSchema);
