var express = require('express');
const backendMemberPageskController = require("../Controller/backendMemberPagesController")
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

router.get('/quickLink', backendMemberPageskController.quickLink);//快捷鍵控制列表
router.post('/quickLink_update', backendMemberPageskController.quickLink_update);//快捷鍵控制列表 修改
router.post('/quickLink_order', backendMemberPageskController.quickLink_order);//快捷鍵控制列表 修改排序


router.get('/announcement', backendMemberPageskController.announcementList);//公告管理
router.post('/announcement_add', backendMemberPageskController.announcementAdd);//公告管理
router.post('/announcement_update', backendMemberPageskController.announcementUpdate);//公告管理
router.post('/announcement_del', backendMemberPageskController.announcementDel);//公告管理


router.get('/advertise', backendMemberPageskController.advertiseList);//首頁輪播管理
router.get('/advertiseOff', backendMemberPageskController.advertiseListOff);//首頁輪播管理 非使用中
router.post('/advertise_Add', upload.single('img'), [
    check('title', '標題必須輸入')
        .isLength({ min: 1 }),
    check('start_time', '開始時間必須輸入')
        .isLength({ min: 1 }),
    check('end_time', '結束時間必須輸入')
        .isLength({ min: 1 }),
], backendMemberPageskController.advertiseList_add);//首頁輪播管理
router.post('/advertise_Update', upload.single('img'), [
    check('title', '標題必須輸入')
        .isLength({ min: 1 }),
    check('start_time', '開始時間必須輸入')
        .isLength({ min: 1 }),
    check('end_time', '結束時間必須輸入')
        .isLength({ min: 1 }),
], backendMemberPageskController.advertiseList_update);//首頁輪播管理
router.post('/advertise_Del', [
    check('id', 'id必須輸入')
        .isLength({ min: 1 }),
], backendMemberPageskController.advertiseList_delete);//首頁輪播管理


router.post('/advertiseFloat', upload.fields([{
    name: 'img_small', maxCount: 1
}, {
    name: 'img', maxCount: 1
}, {
    name: 'img_small_vn', maxCount: 1
}, {
    name: 'img_vn', maxCount: 1
}, {
    name: 'img_small_cn', maxCount: 1
}, {
    name: 'img_cn', maxCount: 1
}]), [
    check('id', 'id必須輸入')
        .isLength({ min: 1 })
], backendMemberPageskController.advertiseFloat);//浮動廣告

router.get('/advertiseFloat_data', backendMemberPageskController.advertiseFloatData);//浮動廣告

router.get('/membersLetter', backendMemberPageskController.letterList);//會員站內信管理
router.post('/membersLetter_add', backendMemberPageskController.letterAdd);//會員站內信管理 新增


router.get('/staticPage', backendMemberPageskController.staticPageList);//靜態頁面設定
router.post('/staticPage_add', backendMemberPageskController.staticPageAdd);//靜態頁面設定 新增
router.post('/staticPage_update', backendMemberPageskController.staticPageUpdate);//靜態頁面設定 修改
module.exports = router;
