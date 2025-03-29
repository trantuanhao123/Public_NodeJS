const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  cauHoi: { type: String, required: true, trim: true },
  loai: { type: String, enum: ["true_false", "short_answer"], required: true },
  ngayTao: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model("Question", questionSchema, "question");