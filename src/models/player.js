const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true,unique: true }, 
    walletAddress: { type: String}, 
    tokenBalance: { type: Number, default: 0 } 
}, { 
    versionKey: false,
    strict: false,
});

const Players = mongoose.model('Players', playerSchema, 'players');

module.exports = Players;
