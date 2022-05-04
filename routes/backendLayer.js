var express = require('express');
const backendLayerController = require("../Controller/backendLayerController")
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
const upload = multer({storage: storage})

router.get('/layerList', backendLayerController.layerList);//荖帶新列表
router.get('/layerDetail', backendLayerController.layerDetail);//荖帶新列表
router.get('/layerDirectly', backendLayerController.layerDirectly);//直屬下線列表

module.exports = router;
