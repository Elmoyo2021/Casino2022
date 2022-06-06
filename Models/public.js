const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
module.exports = class CheckCustomer {
    errorMessage(errors) {//錯誤訊息回傳
        let errorrmsg = errors.array();
        let emsg = "";
        errorrmsg.forEach(function (erow, i) {//錯誤訊息
            emsg = emsg + erow.msg + " ";
        })
        return emsg
    }
    pagination(data) {//分頁設定
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

}