const mongoose = require('mongoose');

const winnerjobsSchema = new mongoose.Schema({
    jobTitle: { type: String, required: true, trim: true }, 
    userAnswer: { type: String, required: true, trim: true }, 
    maNguoiChoi: { type: String, required: true, trim: true }, 
    diaChiVi: { type: String, required: true, trim: true }, 
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('WinnerJob', winnerjobsSchema, 'winnerjobs');
