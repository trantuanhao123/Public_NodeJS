const mongoose = require("mongoose");

const geminiResponseSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: "GeminiRequest", required: true },
    response: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false } 
);

const GeminiResponse = mongoose.model("GeminiResponse", geminiResponseSchema);
module.exports = GeminiResponse;