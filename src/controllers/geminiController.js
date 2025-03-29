const { generateQuestions, kiemTraService, generateText, kiemTraServiceJob } = require("../services/geminiService");
const GeminiRequest = require("../models/geminiRequest");
const GeminiResponse = require("../models/geminiResponse");
const answerFormModel = require("../models/answerForm");
const resultModel = require("../models/result");
const Player = require("../models/player"); 
const Question = require("../models/question");

const askGemini = async (req, res) => {
  try {
    const { question } = req.body; 
    if (!question) {
      return res.status(400).json({ success: false, message: "question là bắt buộc." });
    }

    const newRequest = await GeminiRequest.create({ question });
    const geminiAnswer = await generateText(question);
    const newResponse = await GeminiResponse.create({
      request: newRequest._id,
      response: geminiAnswer,
    });

    res.status(200).json({ success: true, data: newResponse });
  } catch (error) {
    console.error("Lỗi khi gọi API Gemini:", error?.response?.data || error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi gọi Gemini API." });
  }
};

const askForQuestion = async (req, res) => {
  try {
    const questions = await generateQuestions();

    if (!questions || questions.length !== 3) {
      return res.status(400).json({ success: false, message: "Không tạo đủ 3 câu hỏi." });
    }

    const savedQuestions = await Promise.all(
      questions.map(async (q) => {
        try {
          return await Question.create({
            cauHoi: q.cauHoi,
            loai: q.loai, 
            ngayTao: new Date(q.ngayTao),
          });
        } catch (dbError) {
          console.error(`Lỗi khi lưu câu hỏi "${q.cauHoi}":`, dbError);
          throw dbError;
        }
      })
    );
    
    res.status(200).json({ success: true, data: savedQuestions });
  } catch (error) {
    console.error("Lỗi khi tạo và lưu câu hỏi:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ khi tạo câu hỏi." });
  }
};

const kiemTraCauTraLoi = async (req, res) => {
  try {
    const { maNguoiChoi, diaChiVi, questions, answers } = req.body;

    if (!maNguoiChoi || !diaChiVi || !Array.isArray(questions) || !Array.isArray(answers) || questions.length !== answers.length) {
      return res.status(400).json({ success: false, message: "Dữ liệu đầu vào không hợp lệ. Vui lòng kiểm tra lại thông tin người chơi, câu hỏi và câu trả lời." });
    }

    const existingPlayer = await Player.findOne({ name: maNguoiChoi, walletAddress: diaChiVi });
    if (!existingPlayer) {
      return res.status(400).json({ success: false, message: "Người chơi hoặc địa chỉ ví không tồn tại." });
    }

    const existingAnswerForm = await answerFormModel.findOne({ maNguoiChoi, diaChiVi });
    if (existingAnswerForm) {
      return res.status(400).json({ success: false, message: "Câu trả lời của người chơi này đã tồn tại." });
    }

    const answerForm = await answerFormModel.create({ maNguoiChoi, diaChiVi, questions, answers });

    const geminiResult = await kiemTraService(answerForm);

    const resultData = {
      maNguoiChoi: geminiResult.maNguoiChoi,
      diaChiVi: geminiResult.diaChiVi,
      ketQua: geminiResult.ketQua, 
      isPassed: geminiResult.isPassed,
    };


    const newResult = await resultModel.create(resultData);


    return res.status(200).json({ success: true, data: newResult });
  } catch (error) {
    console.error("Lỗi khi kiểm tra câu trả lời:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ khi kiểm tra câu trả lời." });
  }
};
const kiemTraCauTraLoiJob = async (req, res) => {
  try {
    const { userAnswer, jobAnswer } = req.body;

    if (!userAnswer || !jobAnswer) {
      return res.status(400).json({ success: false, message: "Câu trả lời hoặc đáp án chuẩn không được cung cấp." });
    }

    const geminiResult = await kiemTraServiceJob(userAnswer, jobAnswer);

    return res.status(200).json({
      success: true,
      data: {
        isTrue: geminiResult.isTrue,
      },
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra câu trả lời:", error?.response?.data || error.message);
    return res.status(500).json({ success: false, message: error.message || "Lỗi máy chủ khi kiểm tra câu trả lời." });
  }
};
module.exports = { 
  askGemini,
  askForQuestion,
  kiemTraCauTraLoi,
  kiemTraCauTraLoiJob
};