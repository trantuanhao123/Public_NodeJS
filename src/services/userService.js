const Jobs=require("../models/job");
const WinnerJobs =require("../models/winner");

const createWinnerService = async (maNguoiChoi, jobTitle, userAnswer, diaChiVi) => {
    try {
        const newJob = await WinnerJobs.create({ maNguoiChoi, jobTitle, userAnswer, diaChiVi });
        return { success: true, data: newJob };
    } catch (error) {
        console.error("Vấn đề khi thêm job:", error);
        return { success: false, message: error.message || "Lỗi máy chủ nội bộ" };
    }
};

const getJobService = async () => {
    try {
        const results = await Jobs.aggregate([
            {
                $match: {} 
            }
        ]);
        if (!results || results.length === 0) {
            return { success: false, message: "Không có câu hỏi nào." };
        }
        return { success: true, data: results };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu câu hỏi:", error);
        return { success: false, message: error.message || "Lỗi máy chủ nội bộ." };
    }
};

module.exports = {
    createWinnerService,
    getJobService
};