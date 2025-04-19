const axios = require("axios");
require("dotenv").config();
const Question = require("../models/question");
const JSON5 = require('json5');
const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
if (!API_KEY) {
  console.error("❌ LỖI: GEMINI_API_KEY không được cấu hình trong .env");
  throw new Error("GEMINI_API_KEY không được cấu hình trong .env");
}
const parseJsonResponse = (response) => {
  try {
    if (!response?.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Phản hồi từ Gemini API không chứa dữ liệu hợp lệ");
    }
    const textResponse = response.data.candidates[0].content.parts[0].text;
    const cleanedResponse = textResponse.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("❌ Lỗi phân tích JSON:", error.message);
    throw new Error("Không thể phân tích phản hồi JSON từ Gemini API");
  }
};
const generateQuestions = async () => {
  const prompt = `Hãy tạo đúng 3 câu hỏi lập trình với độ khó dễ để kiểm tra kiến thức trung bình.
    - Hai câu đầu tiên phải là câu hỏi dạng True/False.
    - Câu thứ ba là câu hỏi về MongoDB aggregation pipeline ở mức độ beginner, yêu cầu người chơi viết một pipeline đơn giản.
    - Mỗi câu hỏi phải có thêm trường "cauTraLoi".
    - Tuân theo định dạng JSON sau:

    [
      {"cauHoi": "Nội dung câu hỏi 1", "loai": "true_false", "ngayTao": "ISO 8601 format", "cauTraLoi": "true hoặc false"},
      {"cauHoi": "Nội dung câu hỏi 2", "loai": "true_false", "ngayTao": "ISO 8601 format", "cauTraLoi": "true hoặc false"},
      {"cauHoi": "Nội dung câu hỏi 3 về MongoDB pipeline", "loai": "short_answer", "ngayTao": "ISO 8601 format", "cauTraLoi": "Câu trả lời ví dụ là một aggregation pipeline"}
    ]
    Chỉ trả về đúng JSON theo cấu trúc trên, không thêm nội dung nào khác.`;
  try {
    console.log("🔹 Gửi request đến Gemini API...");
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let questions = parseJsonResponse(response);

    if (!Array.isArray(questions) || questions.length !== 3) {
      throw new Error("Gemini API không trả về đúng 3 câu hỏi");
    }

    questions = questions.map((q, index) => {
      const ngayTao = new Date(q.ngayTao);
      return {
        cauHoi: q.cauHoi?.trim() || `Câu hỏi ${index + 1} bị thiếu nội dung`,
        loai: q.loai || (index < 2 ? "true_false" : "short_answer"),
        ngayTao: isNaN(ngayTao) ? new Date().toISOString() : ngayTao.toISOString(),
        cauTraLoi: q.cauTraLoi?.trim() || `Câu trả lời bị thiếu cho câu ${index + 1}`, // Add cauTraLoi
      };
    });

    console.log("✅ Đã tạo câu hỏi hợp lệ:", questions);
    return questions;
  } catch (error) {
    console.error("❌ Lỗi tạo câu hỏi:", error.response?.data || error.message);
    throw error;
  }
};

//   if (!answerForm?.maNguoiChoi || !answerForm?.diaChiVi || !Array.isArray(answerForm.questions) || !Array.isArray(answerForm.answers)) {
//     throw new Error("Dữ liệu đầu vào không hợp lệ");
//   }

//   const prompt = `Người chơi: ${answerForm.maNguoiChoi}
//   Địa chỉ ví: ${answerForm.diaChiVi}
//   Danh sách câu hỏi và câu trả lời:\n${answerForm.questions.map((q, i) => `- Câu hỏi: ${q} | Câu trả lời: ${answerForm.answers[i] || "Chưa có"}`).join("\n")}
  
//   Hãy đánh giá câu trả lời của người chơi và trả về JSON với cấu trúc sau:
//   \`\`\`json
//   {
//     "maNguoiChoi": "${answerForm.maNguoiChoi}",
//     "diaChiVi": "${answerForm.diaChiVi}",
//     "ketQua": [
//       {
//         "cauHoi": "Nội dung câu hỏi",
//         "cauTraLoi": "Câu trả lời của người chơi",
//         "isTrue": <true nếu câu trả lời đúng, false nếu sai>
//       }
//       // Lặp lại cho từng câu hỏi
//     ],
//     "isPassed": <true nếu số câu đúng >= 50% tổng số câu hỏi, ngược lại false>
//   }
//   \`\`\`
//   - Với câu hỏi True/False, chỉ chấp nhận "True" hoặc "False" (không phân biệt hoa thường) làm đáp án hợp lệ và kiểm tra tính đúng đắn dựa trên kiến thức lập trình cơ bản.
//   - Với câu hỏi MongoDB pipeline (câu thứ 3), hãy tự tạo một đáp án chuẩn dựa trên câu hỏi, sau đó so sánh đáp án của người chơi với đáp án chuẩn. Đánh giá dựa trên tính chính xác cú pháp và logic của pipeline (ở mức độ beginner).
//   - Tính tỷ lệ đúng: số câu "isTrue: true" / tổng số câu hỏi. Nếu >= 0.5 thì "isPassed": true.
//   Chỉ trả về JSON theo cấu trúc trên, không thêm nội dung nào khác.`;

//   try {
//     console.log("🔹 Gửi request đến Gemini API để kiểm tra câu trả lời...");
//     const response = await axios.post(GEMINI_API_URL, {
//       contents: [{ parts: [{ text: prompt }] }],
//     });
//     const jsonResponse = parseJsonResponse(response);
//     if (
//       !jsonResponse ||
//       !jsonResponse.maNguoiChoi ||
//       !jsonResponse.diaChiVi ||
//       !Array.isArray(jsonResponse.ketQua) ||
//       typeof jsonResponse.isPassed !== "boolean"
//     ) {
//       throw new Error("Phản hồi từ Gemini API không hợp lệ hoặc thiếu trường bắt buộc");
//     }

//     if (jsonResponse.ketQua.length !== answerForm.questions.length) {
//       throw new Error("Số lượng kết quả từ Gemini không khớp với số câu hỏi");
//     }
//     // Log kết quả từ Gemini để kiểm tra
//     const correctCount = jsonResponse.ketQua.filter((item) => item.isTrue).length;
//     const totalQuestions = jsonResponse.ketQua.length;
//     console.log(`✅ Kết quả từ Gemini: ${correctCount}/${totalQuestions} câu đúng, isPassed: ${jsonResponse.isPassed}`);
//     return {
//       maNguoiChoi: jsonResponse.maNguoiChoi.trim(),
//       diaChiVi: jsonResponse.diaChiVi.trim(),
//       ketQua: jsonResponse.ketQua.map((item) => ({
//         cauHoi: item.cauHoi.trim(),
//         cauTraLoi: item.cauTraLoi.trim(),
//         isTrue: item.isTrue,
//       })),
//       isPassed: jsonResponse.isPassed,
//     };
//   } catch (error) {
//     console.error("❌ Lỗi kiểm tra câu trả lời:", error.response?.data || error.message);
//     throw error;
//   }
// };
const checkMongoDBPipeline = (userAnswer, correctAnswer) => {
  try {
    // Chuẩn hóa chuỗi đầu vào
    const normalize = (str) =>
      str
        .replace(/```json|```/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const parse = (input) => {
      if (typeof input !== "string") return input;
      try {
        return JSON5.parse(normalize(input));
      } catch (e) {
        console.error("❌ JSON parse lỗi:", e.message);
        return null;
      }
    };

    const userPipeline = parse(userAnswer);
    const correctPipeline = parse(correctAnswer);

    if (!Array.isArray(userPipeline) || !Array.isArray(correctPipeline)) {
      console.error("❌ Pipeline không phải mảng:", { userPipeline, correctPipeline });
      return false;
    }

    if (userPipeline.length !== correctPipeline.length) {
      console.error("❌ Số bước trong pipeline không khớp");
      return false;
    }

    const sortObject = (obj) => {
      if (typeof obj !== "object" || obj === null) return obj;
      if (Array.isArray(obj)) return obj.map(sortObject);
      return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
          acc[key] = sortObject(obj[key]);
          return acc;
        }, {});
    };

    for (let i = 0; i < userPipeline.length; i++) {
      const userStage = sortObject(userPipeline[i]);
      const correctStage = sortObject(correctPipeline[i]);

      if (JSON.stringify(userStage) !== JSON.stringify(correctStage)) {
        console.log("❌ Sai tại stage", i + 1);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Lỗi khi so sánh:", error.message);
    return false;
  }
};


const kiemTraService = async (answerForm) => {
  // Kiểm tra dữ liệu đầu vào
  if (!answerForm?.questions || !Array.isArray(answerForm.questions) || answerForm.questions.length === 0) {
    throw new Error("Danh sách câu hỏi không hợp lệ hoặc rỗng");
  }
  if (!answerForm?.answers || !Array.isArray(answerForm.answers) || answerForm.answers.length !== answerForm.questions.length) {
    throw new Error("Danh sách câu trả lời không hợp lệ hoặc không khớp với số lượng câu hỏi");
  }

  // Lấy đáp án chuẩn từ MongoDB
  let correctAnswers;
  try {
    correctAnswers = await Question.find({
      cauHoi: { $in: answerForm.questions },
    }).lean();

    const missingQuestions = answerForm.questions.filter(
      (q) => !correctAnswers.some((ca) => ca.cauHoi === q)
    );
    if (missingQuestions.length > 0) {
      console.error("❌ Các câu hỏi không tìm thấy trong MongoDB:", missingQuestions);
      throw new Error(`Không tìm thấy đáp án cho ${missingQuestions.length} câu hỏi`);
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy đáp án:", error.message);
    throw new Error("Không thể lấy đáp án từ MongoDB");
  }

  // Kiểm tra từng câu trả lời
  const ketQua = answerForm.questions.map((cauHoi, index) => {
    const userAnswer = answerForm.answers[index]?.trim();
    const correctAnswer = correctAnswers.find((item) => item.cauHoi === cauHoi);

    if (!correctAnswer) {
      console.warn(`⚠️ Không tìm thấy đáp án cho câu hỏi: ${cauHoi}`);
      return {
        cauHoi,
        cauTraLoi: userAnswer || "Chưa có",
        isTrue: false,
      };
    }

    let isTrue = false;

    if (correctAnswer.loai === "true_false") {
      if (
        !userAnswer ||
        typeof userAnswer !== "string" ||
        !["true", "false"].includes(userAnswer.toLowerCase())
      ) {
        console.warn(`⚠️ Câu trả lời không hợp lệ cho câu hỏi True/False: ${userAnswer}`);
        return {
          cauHoi,
          cauTraLoi: userAnswer || "Chưa có",
          isTrue: false,
        };
      }

      if (!correctAnswer.cauTraLoi || typeof correctAnswer.cauTraLoi !== "string") {
        console.error(`❌ Đáp án đúng không hợp lệ cho câu hỏi: ${cauHoi}`, correctAnswer);
        return {
          cauHoi,
          cauTraLoi: userAnswer,
          isTrue: false,
        };
      }

      isTrue = userAnswer.trim().toLowerCase() === correctAnswer.cauTraLoi.trim().toLowerCase();
    } else if (correctAnswer.loai === "short_answer") {
      try {
        isTrue = checkMongoDBPipeline(userAnswer, correctAnswer.cauTraLoi);
      } catch (error) {
        console.error(`❌ Lỗi khi kiểm tra pipeline MongoDB cho câu hỏi: ${cauHoi}`, error.message);
        isTrue = false;
      }
    }

    return {
      cauHoi,
      cauTraLoi: userAnswer || "Chưa có",
      isTrue,
    };
  });

  // Tính tỷ lệ đúng
  const correctCount = ketQua.filter((item) => item.isTrue).length;
  const isPassed = correctCount / ketQua.length >= 0.5;

  // Tạo kết quả
  const result = {
    maNguoiChoi: answerForm.maNguoiChoi?.trim() || "Không xác định",
    diaChiVi: answerForm.diaChiVi?.trim() || "Không xác định",
    ketQua,
    isPassed,
  };

  console.log(
    `✅ Kết quả: ${correctCount}/${ketQua.length} câu đúng, isPassed: ${isPassed}`
  );
  return result;
};
module.exports = {
  generateQuestions,
  kiemTraService,
};