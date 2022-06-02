const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const _ = require("lodash");
const public = require('../Models/public');//共用function
publics = new public();
module.exports = class CheckCustomer {
    SelectMembers(data) {//找尋Member
        let sql = 'select * from backend_admin where account=? and pwd=? and status="enable"'
        let dataList = query(sql, [data.account, data.pwd])
        return dataList
    }
    SelectMembersStatus(data) {//找尋Member
        let sql = 'select name,status from backend_admin where account=? and pwd=? '
        let dataList = query(sql, [data.account, data.pwd])
        return dataList
    }

    Login_log(data, data2) {//登入失敗紀錄LOG
        let sql = 'INSERT INTO backend_login_log SET ?'
        let dataList = query(sql, data)


        let sql2 = 'INSERT INTO backend_log SET ?'
        let dataList2 = query(sql2, data2)
        return dataList
    }




    managementLogin(data, data2) {//登入時間 ip 更新
        let sql = 'update backend_admin SET ? where account=?'
        let dataList = query(sql, [data, data2])
        return dataList
    }
}