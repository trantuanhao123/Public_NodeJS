const { createWinnerService,getJobService } = require("../services/userService");
const createJobsWinner = async (req, res) => {
    try {
        const { diaChiVi, maNguoiChoi, jobTitle, userAnswer } = req.body;

        // Kiểm tra xem dữ liệu đầu vào có đầy đủ không
        if (![diaChiVi, maNguoiChoi, jobTitle, userAnswer].every(Boolean)) {
            return res.status(400).json({ 
                success: false, 
                message: "Thiếu thông tin bắt buộc." 
            });
        }

        // Gọi service để xử lý logic thêm/cập nhật
        const result = await createWinnerService(maNguoiChoi, jobTitle, userAnswer, diaChiVi);

        return res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        console.error("Lỗi khi xử lý yêu cầu:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ nội bộ.", 
            error: error.message 
        });
    }
};

const getJob = async (req, res) => {
    try {
        const result = await getJobService(); 
        
        return res.status(200).json(result); 
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu câu hỏi:", error);
        return res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ." });
    }
};


module.exports = {
    createJobsWinner,
    getJob,
}