var express = require('express');
var router = express.Router();

const backendController = require("../Controller/backendController")
const { check, validationResult } = require('express-validator')

router.post('/login', [//後台登入
  check('account', '帳號必須填寫')
      .isLength({ min: 1 }),
  check('pwd', '密碼必須填寫')
      .isLength({ min: 1 })
], backendController.login);//後台登入
module.exports = router;
