const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  maNguoiChoi: { type: String, required: true, trim: true },
  diaChiVi: { type: String, required: true, trim: true },
  ketQua: [
    {
      cauHoi: { type: String, required: true },
      cauTraLoi: { type: String, required: true },
      isTrue: { type: Boolean, required: true },
    },
  ],
  isPassed: { type: Boolean, required: true },
}, { timestamps: true, versionKey: false });

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;