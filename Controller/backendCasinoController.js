const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var moment = require('moment'); // require
var geoip = require('geoip-lite');
const fs = require('fs')

const backendCasinoController = {
    gameList: async (req, res) => {//快捷列表
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "查看失敗",
                data: error_msg
            });
        } else {
            const selectGameLists = await selectGameList()//呼叫列表
            return res.json({//回傳成功
                code: 200,
                msg: "回傳成功",
                data: selectGameLists
            });
        }
    }

}



function errorMessage(errors) {//錯誤訊息回傳
    let errorrmsg = errors.array();
    let emsg = "";
    errorrmsg.forEach(function (erow, i) {//錯誤訊息
        emsg = emsg + erow.msg + " ";
    })
    return emsg
}
function pagination(data) {//分頁設定
    let skip = 0
    let limit = 20
    let orderBy = "id"
    let order = "ASC"

    if (data.query.skip) {
        skip = data.query.skip
    }
    if (data.query.limit) {
        limit = data.query.limit
    }
    if (data.query.orderBy) {
        orderBy = data.query.orderBy
    }
    if (data.query.order) {
        order = data.query.order
    }
    const conditionData = {
        skip: skip,
        limit: limit,
        orderBy: orderBy,
        order: order //排序類型
    }
    return conditionData
}


function selectGameList(data) {//查看toGroupList
    let sql = 'SELECT id FROM `game_list`'
    let dataList = query(sql, [data])
    return dataList
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


function checkStatus(stime, etime, status) {
    if (status == "disble") {
        return "停用"
    } else if (stime <= moment().format('YYYY-MM-DD HH:mm:ss') && etime >= moment().format('YYYY-MM-DD HH:mm:ss')) {
        return "運行中"
    } else {
        return "逾期"
    }
}


function fileNameSet(originalname, path, newPath) {//上傳圖片 originalname上傳檔名 path上傳暫存位置 newPath上傳資料夾
    extName = originalname.slice(originalname.lastIndexOf("."));//取得副檔名
    const filesName = "adfloat" + moment().format('YYYYMMDD_hhmmss') + "_" + getRandom(11111, 99999) + extName;
    fs.rename(path, newPath + filesName, () => { })//上傳圖片
    fs.unlink(path, error => { return "Error" }); // 刪除暫存檔
    return filesName;
}
module.exports = backendCasinoController;