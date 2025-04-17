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
      const pipeline = [
        {
          $match: { name } 
        },
        {
          $set: {
            tokenBalance: { $add: ["$tokenBalance", tokenBalance] }
          }
        },
        {
          $merge: {
            into: "players",
            whenMatched: "merge",
            whenNotMatched: "fail" 
          }
        }
      ];
      const result = await Player.aggregate(pipeline);
      const updatedPlayer = await Player.findOne({ name });
      if (!updatedPlayer) {
        return { success: false, message: "Không tìm thấy người chơi" };
      }
      return {
        success: true,
        message: "Cập nhật số dư token thành công",
        data: updatedPlayer
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật số dư token:", error);
      return { success: false, message: "Lỗi máy chủ nội bộ." };
    }
};
const updateJobCompletionService = async (title) => {
    try {
      const pipeline = [
        {
          $match: { title } 
        },
        {
          $set: { isCompleted: true } 
        },
        {
          $merge: {
            into: "jobs",               
            whenMatched: "merge",       
            whenNotMatched: "fail"      
          }
        }
      ];
      await Job.aggregate(pipeline);
      const updatedJob = await Job.findOne({ title });
      if (!updatedJob) {
        return { success: false, message: "Không tìm thấy công việc" };
      }
      return {
        success: true,
        message: "Cập nhật trạng thái công việc thành công",
        data: updatedJob
      };
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái công việc:", error);
      return { success: false, message: "Lỗi máy chủ nội bộ." };
    }
};
const getWinnerService = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 

        const results = await Result.aggregate([
            {
                $match: {
                    isPassed: true
                }
            },
            {
                $group: {
                    _id: "$maNguoiChoi", 
                    diaChiVi: { $first: "$diaChiVi" } 
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
