const express = require('express');
const { createJobsWinner,getJob } = require('../controllers/userController');
const { askForQuestion,kiemTraCauTraLoi} = require("../controllers/geminiController");
const {createPlayer,updateWalletWinner,updateJobCompletion,getWinner}= require("../controllers/playerController");
const routerAPI = express.Router();
//API liên quan đến tạo và dự đoán
routerAPI.post("/createwinner", createJobsWinner);
routerAPI.post("/kiemtra",kiemTraCauTraLoi);
routerAPI.post("/createplayer",createPlayer);
routerAPI.post("/updateplayer",updateWalletWinner);
routerAPI.post("/updatejobs",updateJobCompletion);
//API liên quan đến tìm ra winner 
routerAPI.get("/getjob",getJob);
routerAPI.get("/generateQuestion",askForQuestion);
routerAPI.get("/getwinner",getWinner);
module.exports = routerAPI; 
