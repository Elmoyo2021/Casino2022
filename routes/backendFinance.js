var express = require('express');
const backendFinanceController = require("../Controller/backendFinanceController")
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

router.get('/depositList', backendFinanceController.depositList);//存款記錄列表

router.get('/depositMember', backendFinanceController.depositMember);//存款請求明細_個人
router.get('/depositData', backendFinanceController.depositData);//存款資訊
router.get('/depositLimitList', backendFinanceController.depositLimitList);//存款限制時限

router.post('/depositListRemark', backendFinanceController.depositListRemark);//存款記錄列表 前台備註更新
router.get('/withdrawList', backendFinanceController.withdrawList);//取款記錄列表
router.get('/depositInfo', backendFinanceController.depositInfo);//存款方式設定
router.post('/depositInfoUpdateContent', backendFinanceController.depositInfoUpdateContent);//存款方式設定

router.post('/depositInfoUpdate', [
    check('id', 'id必須填寫')
        .isLength({ min: 1 }),
    check('title', '標題必須填寫')
        .isLength({ min: 1 }),
    check('title_vn', '標題(越南文)必須填寫')
        .isLength({ min: 1 }),
    check('title_en', '標題(英文)必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.depositInfoUpdate);//存款方式設定
router.get('/depositPages', backendFinanceController.depositPages);//存款頁面設定
router.post('/depositPagesUpdate', backendFinanceController.depositPagesUpdate);//存款頁面設定



router.get('/walletLog', backendFinanceController.walletLog);//錢包間進出紀錄
/*router.get('/depositSet', backendFinanceController.depositSet);//存款方式頁面設定*/
router.post('/withdrawAudit', [
    check('id', '提款id必須填寫')
        .isLength({ min: 1 }),
    check('status', '稽核狀態必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.withdrawAudit);//取款記錄列表-審核
router.get('/financeAccount', backendFinanceController.financeAccountList);//公司出入款帳戶
router.post('/financeAccountAdd', backendFinanceController.financeAccountAdd);//公司出入款帳戶

router.get('/transactionsLog', backendFinanceController.transactionsLog);//公司出入款帳戶


router.get('/bankList', backendFinanceController.bankList);//銀行列表
router.post('/bankListAdd', upload.single('img'), [//銀行列表 新增
    check('bank_type', '銀行類型必須填寫')
        .isLength({ min: 1 }),
    check('bank', '銀行名稱必須填寫')
        .isLength({ min: 1 }),
    check('bank_cn', '簡中名稱必須填寫')
        .isLength({ min: 1 }),
    check('bank_preset', '預設語系名稱必須填寫')
        .isLength({ min: 1 }),
    check('url', '網銀網址必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.bankListAdd);//公司出入款帳戶
router.get('/thirdPlatform', backendFinanceController.thirdPlatform);//銀行列表
router.post('/third_platformAdd', [//第三方平台 新增
    check('title', '銀行類型必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.thirdPlatformAdd);//三方平台新增


router.get('/thirdPlatform', backendFinanceController.thirdPlatform);//銀行列表
/*
router.post('/members_add', [//會員列表 新增
    check('account', '帳號必須填寫')
        .isLength({ min: 1 }),
    check('pwd', '密碼必須填寫')
        .isLength({ min: 1 }),
    check('name', '姓名必須填寫')
        .isLength({ min: 1 }),
    check('currency', '幣別必須填寫')
        .isLength({ min: 1 }),
], backendFinanceController.postAdd);*/
module.exports = router;
