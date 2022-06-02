const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const _ = require("lodash");
const public = require('../Models/public');//共用function
publics = new public();
module.exports = class CheckCustomer {
    managementList(data) {//管理員列表
        let sql = "select a.id,a.account,a.name,b.name as group_name,last_time,last_ip,a.status,a.online_status from backend_admin a left join backend_admin_group b on a.group_id=b.id order by a." + data.orderBy + " " + data.order + " limit ?,?"
        let dataList = query(sql, [Number(data.skip), Number(data.limit)])
        return dataList
    }
    managementTotal(data) {//管理員總數
        let sql = 'SELECT count(*) as total FROM `backend_admin`'
        let dataList = query(sql)
        return dataList
    }

    managementData(data) {//管理員列表
        let sql = "select a.*,b.name as group_name from backend_admin a left join backend_admin_group b on a.group_id=b.id  where a.id=?"
        let dataList = query(sql, [data])
        console.log(data)
        return dataList
    }

}