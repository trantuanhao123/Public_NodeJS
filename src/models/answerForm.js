const mongoose = require('mongoose');

const answerFormSchema = new mongoose.Schema({
    maNguoiChoi: { type: String, required: true, trim: true }, // Mã người chơi
    diaChiVi: { type: String, required: true, trim: true }, //Địa chỉ ví
    questions: [{ type: String, required: true, trim: true }], // Mảng câu hỏi
    answers: [{ type: String, required: true, trim: true }] // Mảng câu trả lời
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('answerForm', answerFormSchema);
