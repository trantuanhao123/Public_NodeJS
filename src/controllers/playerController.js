const Player = require("../models/player");
const {
  createPlayerService,
  getWinnerService,
  updateWalletWinnerService,
  updateJobCompletionService,
} = require("../services/playerService");
//Xử Lý Cho Phương Thức Post
// const createPlayer = async (req, res) => {
//     try {
//         const { name, walletAddress, tokenBalance } = req.body;
//         const existingPlayer = await Player.findOne({ name });
//         if (existingPlayer) {
//             return res.status(400).json({ message: "Tên người chơi đã được sử dụng" });
//         }
//         const data = await createPlayerService(name, walletAddress, tokenBalance);
//         return res.status(200).json(data);
//     } catch (error) {
//         console.error("Lỗi khi tạo người chơi:", error);
//         return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
//     }
// };
const createPlayer = async (req, res) => {
  try {
    const { name, walletAddress, tokenBalance, ...rest } = req.body; // Lấy tất cả các trường còn lại
    const existingPlayer = await Player.findOne({ name });
    if (existingPlayer) {
      return res
        .status(400)
        .json({ message: "Tên người chơi đã được sử dụng" });
    }
    const data = await createPlayerService({
      name,
      walletAddress,
      tokenBalance,
      ...rest,
    });
    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi tạo người chơi:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
const updateWalletWinner = async (req, res) => {
  try {
    const { name, tokenBalance, maNguoiChoi } = req.body;

    if (!(name || maNguoiChoi) || tokenBalance === undefined) {
      return res
        .status(400)
        .json({ message: "Tên người chơi và số dư token là bắt buộc" });
    }
    const playerName = name || maNguoiChoi;
    const data = await updateWalletWinnerService(playerName, tokenBalance);
    if (!data.success) {
      return res.status(404).json({ message: data.message });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi cập nhật số dư token:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
const updateJobCompletion = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Tiêu đề công việc là bắt buộc" });
    }

    const data = await updateJobCompletionService(title);
    if (!data.success) {
      return res.status(404).json({ message: data.message });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái công việc:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};
//Xử Lý Cho Phương Thức Get
const getWinner = async (req, res) => {
  try {
    const result = await getWinnerService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu kết quả:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi máy chủ nội bộ." });
  }
};

module.exports = {
  createPlayer,
  getWinner,
  updateJobCompletion,
  updateWalletWinner,
};
