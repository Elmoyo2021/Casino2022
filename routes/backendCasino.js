var express = require('express');
const backendMemberPageskController = require("../Controller/backendCasinoController")
const { check, validationResult } = require('express-validator')
var router = express.Router();
const { query } = require('../async-db')


const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.filename + '-' + Date.now())
    }
})
const upload = multer({ storage: storage })


//router.post('/advertiseFloat', backendMemberPageskController.advertiseFloat);//浮動廣告管理 新增

router.get('/gameList', backendMemberPageskController.gameList);//會員站內信管理
module.exports = router;
