const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const _ = require("lodash");
const public = require('./public');//共用function
publics = new public();
module.exports = class CheckCustomer {

    countAllMember() {
        let sql = 'select count(*) as total from members '
        let dataList = query(sql)
        return dataList
    }

    countProfitToday(data) {
        let sql = 'select sum(profit) as total from baccarat_bet where status="finish" and Createtime BETWEEN ? AND ?'
        let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
        return dataList
    }
    countRegisterTopData(firstDay, today) {
        let sql = 'select count(*) as total from members where Createtime BETWEEN ? AND ?'
        let dataList = query(sql, [firstDay + " 00:00:00", today + " 23:59:59"])
        return dataList
    }

    countRegister(data) {
        let sql = 'select count(*) as total from members where Createtime BETWEEN ? AND ?'
        let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
        return dataList
    }
    countRegisterDeposit(data) {
        let sql = 'select sum(pay_amount) as total from `deposit_order` where status="finish" and Createtime BETWEEN ? AND ?'
        let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
        return dataList
    }
    countAmountWithdrawal(data) {
        let sql = 'select count(*) as total from (select member_id from `withdraw_order` where status="finish" and Createtime BETWEEN ? AND ? group by member_id) as a'
        let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
        return dataList
    }
    countWithdrawal(data) {
        let sql = 'select sum(actual_amount) as total from `withdraw_order` where status="finish" and Createtime BETWEEN ? AND ?'
        let dataList = query(sql, [data + " 00:00:00", data + " 23:59:59"])
        return dataList
    }


    topDepositMembers(data) {
        let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.pay_amount) as amount FROM deposit_order a left join members b on a.member_id=b.id WHERE a.status = "1" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
        let dataList = query(sql)
        return dataList
    }
    topDepositToday(data) {
        today = moment().format('YYYY-MM-DD');
        let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.pay_amount) as amount FROM deposit_order a left join members b on a.member_id=b.id WHERE a.status = "1" and a.Createtime between "' + today + ' 00:00:00" and "' + today + ' 23:59:59" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
        let dataList = query(sql)
        return dataList
    }
    topWithdrawalMembers(data) {
        let sql = 'select * from (SELECT a.member_id,b.account, COUNT(*) as total,sum(a.actual_amount) as amount FROM withdraw_order a left join members b on a.member_id=b.id WHERE a.status = "finish" GROUP BY a.member_id HAVING COUNT(*) > 0 limit 0,10) as a order by total DESC'
        let dataList = query(sql)
        return dataList
    }
}