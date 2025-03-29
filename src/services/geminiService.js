const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

if (!API_KEY) {
  console.error("❌ LỖI: GEMINI_API_KEY không được cấu hình trong .env");
  throw new Error("GEMINI_API_KEY không được cấu hình trong .env");
}

/**
 * 🛠️ Hàm xử lý phản hồi JSON từ Gemini API
 */
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

/**
 * 🚀 Hàm gọi Gemini API để sinh văn bản từ prompt
 */
const generateText = async (prompt) => {
  try {
    console.log("🔹 Gửi request đến Gemini API với prompt:", prompt);
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    return parseJsonResponse(response);
  } catch (error) {
    console.error("❌ Lỗi từ Gemini API:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 🎯 Hàm tạo câu hỏi từ Gemini API
 */
const generateQuestions = async () => {
  const prompt = `Hãy tạo đúng 3 câu hỏi lập trình với độ khó dễ để kiểm tra kiến thức cơ bản. 
  - Hai câu đầu tiên phải là câu hỏi dạng True/False.
  - Câu thứ ba là câu hỏi về MongoDB aggregation pipeline ở mức độ beginner, yêu cầu người chơi viết một pipeline đơn giản.
  - Mỗi câu hỏi phải tuân theo định dạng JSON sau:
  
  [
    {"cauHoi": "Nội dung câu hỏi (True/False)", "loai": "true_false", "ngayTao": "ISO 8601 format"},
    {"cauHoi": "Nội dung câu hỏi (True/False)", "loai": "true_false", "ngayTao": "ISO 8601 format"},
    {"cauHoi": "Nội dung câu hỏi về MongoDB pipeline", "loai": "short_answer", "ngayTao": "ISO 8601 format"}
  ]

  Chỉ trả về JSON theo cấu trúc trên, không thêm nội dung nào khác.`;

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
      };
    });

    console.log("✅ Đã tạo câu hỏi hợp lệ:", questions);
    return questions;
  } catch (error) {
    console.error("❌ Lỗi tạo câu hỏi:", error.response?.data || error.message);
    throw error;
  }
};
const kiemTraService = async (answerForm) => {
  if (!answerForm?.maNguoiChoi || !answerForm?.diaChiVi || !Array.isArray(answerForm.questions) || !Array.isArray(answerForm.answers)) {
    throw new Error("Dữ liệu đầu vào không hợp lệ");
  }

  const prompt = `Người chơi: ${answerForm.maNguoiChoi}
  Địa chỉ ví: ${answerForm.diaChiVi}
  Danh sách câu hỏi và câu trả lời:\n${answerForm.questions.map((q, i) => `- Câu hỏi: ${q} | Câu trả lời: ${answerForm.answers[i] || "Chưa có"}`).join("\n")}
  
  Hãy đánh giá câu trả lời của người chơi và trả về JSON với cấu trúc sau:
  \`\`\`json
  {
    "maNguoiChoi": "${answerForm.maNguoiChoi}",
    "diaChiVi": "${answerForm.diaChiVi}",
    "ketQua": [
      {
        "cauHoi": "Nội dung câu hỏi",
        "cauTraLoi": "Câu trả lời của người chơi",
        "isTrue": <true nếu câu trả lời đúng, false nếu sai>
      }
      // Lặp lại cho từng câu hỏi
    ],
    "isPassed": <true nếu số câu đúng >= 50% tổng số câu hỏi, ngược lại false>
  }
  \`\`\`
  - Với câu hỏi True/False, chỉ chấp nhận "True" hoặc "False" (không phân biệt hoa thường) làm đáp án hợp lệ và kiểm tra tính đúng đắn dựa trên kiến thức lập trình cơ bản.
  - Với câu hỏi MongoDB pipeline (câu thứ 3), hãy tự tạo một đáp án chuẩn dựa trên câu hỏi, sau đó so sánh đáp án của người chơi với đáp án chuẩn. Đánh giá dựa trên tính chính xác cú pháp và logic của pipeline (ở mức độ beginner).
  - Tính tỷ lệ đúng: số câu "isTrue: true" / tổng số câu hỏi. Nếu >= 0.5 thì "isPassed": true.
  Chỉ trả về JSON theo cấu trúc trên, không thêm nội dung nào khác.`;

  try {
    console.log("🔹 Gửi request đến Gemini API để kiểm tra câu trả lời...");
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const jsonResponse = parseJsonResponse(response);

    if (
      !jsonResponse ||
      !jsonResponse.maNguoiChoi ||
      !jsonResponse.diaChiVi ||
      !Array.isArray(jsonResponse.ketQua) ||
      typeof jsonResponse.isPassed !== "boolean"
    ) {
      throw new Error("Phản hồi từ Gemini API không hợp lệ hoặc thiếu trường bắt buộc");
    }

    if (jsonResponse.ketQua.length !== answerForm.questions.length) {
      throw new Error("Số lượng kết quả từ Gemini không khớp với số câu hỏi");
    }

    // Log kết quả từ Gemini để kiểm tra
    const correctCount = jsonResponse.ketQua.filter((item) => item.isTrue).length;
    const totalQuestions = jsonResponse.ketQua.length;
    console.log(`✅ Kết quả từ Gemini: ${correctCount}/${totalQuestions} câu đúng, isPassed: ${jsonResponse.isPassed}`);

    return {
      maNguoiChoi: jsonResponse.maNguoiChoi.trim(),
      diaChiVi: jsonResponse.diaChiVi.trim(),
      ketQua: jsonResponse.ketQua.map((item) => ({
        cauHoi: item.cauHoi.trim(),
        cauTraLoi: item.cauTraLoi.trim(),
        isTrue: item.isTrue,
      })),
      isPassed: jsonResponse.isPassed,
    };
  } catch (error) {
    console.error("❌ Lỗi kiểm tra câu trả lời:", error.response?.data || error.message);
    throw error;
  }
};
const kiemTraServiceJob = async (userAnswer, jobAnswer) => {
  if (!userAnswer || !jobAnswer) {
    throw new Error("Dữ liệu đầu vào không hợp lệ: userAnswer hoặc jobAnswer bị thiếu hoặc rỗng");
  }

  if (typeof userAnswer !== 'string' || typeof jobAnswer !== 'string') {
    throw new Error("Dữ liệu đầu vào phải là chuỗi JSON");
  }
  const prompt = `Câu trả lời của người chơi (MongoDB pipeline): ${userAnswer}
  Đáp án chuẩn (MongoDB pipeline): ${jobAnswer}

  Hãy so sánh hai MongoDB pipeline trên bằng cách kiểm tra xem chúng có tạo ra cùng một sample output hay không khi áp dụng trên một tập dữ liệu mẫu. Trả về JSON với cấu trúc sau:
  \`\`\`json
  {
    "isTrue": <true nếu hai pipeline cho ra cùng sample output, false nếu khác>
  }
  \`\`\`
  - Đầu vào là hai MongoDB pipeline.
  - Chỉ so sánh dựa trên sample output, không cần pipeline phải giống hệt nhau về cú pháp.
  - Trả về JSON đúng định dạng, không thêm nội dung khác.`;
 

  try {
    console.log("🔹 Gửi request đến Gemini API để kiểm tra câu trả lời...");
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const jsonResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonResponse) {
      throw new Error("Không nhận được phản hồi hợp lệ từ Gemini API");
    }

    // Làm sạch phản hồi: Loại bỏ ```json, ``` và các ký tự thừa
    const cleanedResponse = jsonResponse
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    // Phân tích cú pháp JSON từ phản hồi đã làm sạch
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      throw new Error("Phản hồi từ Gemini API sau khi làm sạch vẫn không phải JSON hợp lệ: " + parseError.message);
    }

    // Kiểm tra định dạng phản hồi: Chỉ cần isTrue là boolean
    if (typeof parsedResponse.isTrue !== "boolean") {
      throw new Error("Phản hồi từ Gemini API không hợp lệ: Thiếu hoặc sai kiểu dữ liệu isTrue");
    }

    console.log(`✅ Kết quả kiểm tra: isTrue: ${parsedResponse.isTrue}`);
    return parsedResponse;
  } catch (error) {
    console.error("❌ Lỗi kiểm tra câu trả lời:", error.response?.data || error.message);
    throw error;
  }
};
module.exports = {
  generateText,
  generateQuestions,
  kiemTraService,
  kiemTraServiceJob
};