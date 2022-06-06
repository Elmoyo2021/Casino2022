const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require

const backendReportController = {
    rebateSet: async (req, res) => {//反水設置列表
        const rebateSetLists = await rebateSetList()//前10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: rebateSetLists
        });

    },
    rebateAdd: async (req, res) => {//反水設置列表 新增
        const rebateSetLists = await rebateSetList()//前10大存款
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: rebateSetLists
        });

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


function rebateSetList(data) {
    let sql = 'select * from rebat_set order by id ASC'
    let dataList = query(sql)
    return dataList
}
module.exports = backendReportController;