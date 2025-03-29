const Player= require("../models/player")
const Result = require("../models/result");
const Job =require("../models/job");
const createPlayerService = async (name, walletAddress, tokenBalance = 0) => {
    try {
        const existingPlayer = await Player.findOne({ name });
        if (existingPlayer) {
            return { success: true, message: "Người chơi đã tồn tại", data: existingPlayer };
        }
        let result = await Player.create({
            name,
            walletAddress,
            tokenBalance
        });
        return { success: true, data: result };
    } catch (error) {
        console.error("Lỗi khi tạo người chơi:", error);
        return { success: false, message: "Lỗi máy chủ nội bộ." };
    }
};
const updateWalletWinnerService = async (name, tokenBalance) => {
    try {
        const existingPlayer = await Player.findOne({ name });
        if (!existingPlayer) {
            return { success: false, message: "Không tìm thấy người chơi" };
        }
        
        const updatedPlayer = await Player.findOneAndUpdate(
            { name },
            { $inc: { tokenBalance: tokenBalance } }, // Sử dụng $inc để cộng thêm
            { new: true } // Trả về document đã được cập nhật
        );
        
        return { success: true, message: "Cập nhật số dư token thành công", data: updatedPlayer };
    } catch (error) {
        console.error("Lỗi khi cập nhật số dư token:", error);
        return { success: false, message: "Lỗi máy chủ nội bộ." };
    }
};
const updateJobCompletionService = async (title) => {
    try {
        const existingJob = await Job.findOne({ title });
        if (!existingJob) {
            return { success: false, message: "Không tìm thấy công việc" };
        }
        const updatedJob = await Job.findOneAndUpdate(
            { title },
            { isCompleted: true },
            { new: true } 
        );
        return { success: true, message: "Cập nhật trạng thái công việc thành công", data: updatedJob };
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái công việc:", error);
        return { success: false, message: "Lỗi máy chủ nội bộ." };
    }
};
const getWinnerService = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu của ngày

        const results = await Result.aggregate([
            {
                $match: {
                    isPassed: true
                }
            },
            {
                $group: {
                    _id: "$maNguoiChoi", // Nhóm theo maNguoiChoi để loại bỏ trùng lặp
                    diaChiVi: { $first: "$diaChiVi" } // Lấy địa chỉ ví đầu tiên của người chơi
                }
            },
            {
                $project: { 
                    _id: 0, 
                    maNguoiChoi: "$_id", 
                    diaChiVi: 1 
                }
            }
        ]);

        if (!results || results.length === 0) {
            return { success: false, message: "Không có kết quả nào đúng trong ngày hôm nay." };
        }
        return { success: true, data: results };
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu kết quả:", error);
        return { success: false, message: error.message || "Lỗi máy chủ nội bộ." };
    }
};


module.exports = {
    createPlayerService,
    updateWalletWinnerService,
    updateJobCompletionService,
    getWinnerService
};
