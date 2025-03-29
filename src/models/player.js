const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true,unique: true }, // Tên người chơi
    walletAddress: { type: String}, // Địa chỉ ví blockchain
    tokenBalance: { type: Number, default: 0 } // Số dư token
}, { versionKey: false });

const Players = mongoose.model('Players', playerSchema, 'players');

module.exports = Players;
