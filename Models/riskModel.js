const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const _ = require("lodash");
const public = require('../Models/public');//共用function
publics = new public();
module.exports = class CheckCustomer {

    whiteList(data) {//黑白名單列表
        let sql = "select * from backend_whitelist  order by " + data.orderBy + " " + data.order + " limit ?,?"
        let dataList = query(sql, [Number(data.skip), Number(data.limit)])
        return dataList
    }
    async whiteListTotal(conditionData) {//黑白名單總數
        let sql = 'SELECT count(*) as total FROM `backend_whitelist`'
        let dataList =await query(sql)
        const total = Math.ceil(Number(dataList[0].total) / Number(conditionData.limit))//最大頁數
        return total
    }
    whiteListCheck(data) {//查看backend_whitelist
        let sql = 'SELECT * FROM `backend_whitelist` where id=?'
        let dataList = query(sql, [data])
        return dataList
    }
    whiteListCheckIp(data) {//查看backend_whitelist
        let sql = 'SELECT * FROM `backend_whitelist` where ip=?'
        let dataList = query(sql, [data])
        return dataList
    }
    whiteListInsert(data) {//寫入backend_whitelist資料庫
        let sql = 'INSERT INTO backend_whitelist SET ?'
        let dataList = query(sql, data)
        return dataList
    }

    whiteListUpdate(data, id) {//更新backend_whitelist資料庫
        let sql = 'update backend_whitelist SET ? where id=?'
        let dataList = query(sql, [data, id])
        return dataList
    }
    whiteListDel(id) {//刪除backend_whitelist資料庫
        let sql = 'delete from backend_whitelist  where id=?'
        let dataList = query(sql, [id])
        return dataList
    }
}