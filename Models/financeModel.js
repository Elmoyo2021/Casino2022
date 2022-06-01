const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const _ = require("lodash");
const public = require('../Models/public');//共用function
publics = new public();
module.exports = class CheckCustomer {
    async thirdPlatformSearch(condition) {//第三方平台搜尋回傳
        var sqlCondition = ""
        if (condition.platform != "all") {//第三方平台
            sqlCondition = "platform=? "
        } else {
            sqlCondition = "platform not in (?) "
            condition.platform = "allPlatform"
        }
        if (condition.platform_type != "all") {//平台類型
            sqlCondition = sqlCondition + "and platform_type=? "
        } else {
            sqlCondition = sqlCondition + "and platform_type not in (?) "
            condition.platform_type = "allPlatform_type"
        }
        if (condition.currency != "all") {//幣別
            sqlCondition = sqlCondition + "and currency=? "
        } else {
            sqlCondition = sqlCondition + "and currency not in (?) "
            condition.currency = "allCurrency"
        }
        if (condition.income_status != "all") {//收款狀態
            sqlCondition = sqlCondition + "and income_status=? "
        } else {
            sqlCondition = sqlCondition + "and income_status not in (?) "
            condition.income_status = "allIncome_status"
        }

        const payLists = [{ title: "momo", type: "momo_pay" }, { title: "debitCard", type: "debit_card" }, { title: "QR", type: "bank_qr" }, { title: "zalo", type: "zalo_pay" }, { title: "viettel", type: "viettel_pay" }, { title: "scratchcard", type: "scratchcard" }]
        const checkPayType = _.find(payLists, { "title": condition.pay_type });//確認是否有此支付類型

        if (checkPayType != undefined && checkPayType != "all") {//支付類型
            sqlCondition = sqlCondition + "and " + checkPayType.type + "='enable' "
        }

        let sql = 'SELECT * FROM `third_platform` where ' + sqlCondition
        let dataList = await query(sql, [condition.platform, condition.platform_type, condition.currency, condition.income_status])
        return dataList
    }
    checkDepositData(data) {
        let sql = "select bank,bank_account_name,bank_account,bank_branch from deposit_order where id=?"
        let dataList = query(sql, [data])
        return dataList
    }
    depositLimitList(data) {
        let sql = 'SELECT * from deposit_limit where deposit_group=?'
        let dataList = query(sql, [data])
        return dataList
    }
    async depositMemberData(id) {//檢查是否有此筆存款訂單
        let sql = 'SELECT a.postscript,b.Createtime,b.account,b.name,a.auditors,c.name as hierarchy,b.Createtime as auditors_time,a.bank,a.deposit_type,a.deposit_time,a.amount,a.Createtime as submit_time,a.ip,a.deposit_name,a.status,a.bank,a.bank_account,a.bank_branch,a.bank_account_name from deposit_order a left join members b on a.member_id = b.id left join hierarchy_detail c on b.hierarchy_detail_id = c.id where a.id=?'
        let dataList = await query(sql, [id])

        const membersData = {
            postscript: dataList[0].postscript,
            members_CraateTime: dataList[0].Createtime,
            account: dataList[0].account,
            first_deposit: false,
            name: dataList[0].name,
            auditors: dataList[0].auditors,
            hierarchy: dataList[0].hierarchy,
            auditors_time: dataList[0].auditors_time
        }
        const deposiDetail = {
            //pay_type:"公司入帳",
            bank: dataList[0].bank,
            deposit_type: dataList[0].deposit_type,
            deposit_time: dataList[0].deposit_time,
            amount: dataList[0].amount,
            submit_time: dataList[0].Createtime,
            ip: dataList[0].ip,
            deposit_name: dataList[0].deposit_name,
            status: dataList[0].status
        }
        const receivingAccount = {
            bank: dataList[0].bank,
            bank_account: dataList[0].bank_account,
            bank_branch: dataList[0].bank_branch,
            bank_account_name: dataList[0].bank_account_name
        }
        const returnData = {
            memberData: membersData,
            deposiDetail: deposiDetail,
            receivingAccount: receivingAccount
        }
        return returnData
    }
    depositList(data) {//存款列表
        let sql = 'SELECT a.id,a.Createtime,a.postscript,c.name as agency_team,d.name as hierarchy,b.account,b.name,a.deposit_type,a.remark,a.amount,a.pay_amount,e.title as pay_info,a.status FROM deposit_order a left join members b on a.member_id=b.id left join agency_team c on b.agency_team_id=c.id left join hierarchy_detail d on b.hierarchy_detail_id=d.id left join third_platform e on a.aisle=e.id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
        let dataList = query(sql, [Number(data.skip), Number(data.limit)])
        return dataList
    }
    async depositListTotal(conditionData) {//存款列表總筆數
        let sql = 'SELECT count(*) as total FROM deposit_order a left join members b on a.member_id=b.id left join agency_team c on b.agency_team_id=c.id left join hierarchy_detail d on b.hierarchy_detail_id=d.id left join third_platform e on a.aisle=e.id'
        let dataList = await query(sql)
        var string = JSON.stringify(dataList);
        var dataRt = JSON.parse(string)
        return dataRt[0].total
    }
    checkDepositListRemark(data) {//檢查是否有此id
        let sql = 'SELECT * FROM `deposit_order` where id=?'
        let dataList = query(sql, [data])
        return dataList
    }
    updateDepositListRemark(updateData, id) {//檢查是否有此id
        let sql = 'update `deposit_order` set remark=? where id=?'
        let dataList = query(sql, [updateData, id])
        return dataList
    }

    async withdrawList(data) {
        let sql = 'SELECT a.id,a.Createtime,d.name as agency_team,c.name as hierarchy,b.account,b.name,b.tags,e.bank,e.account as bank_account,e.name as bank_name,a.amount as withdraw_amount,a.status,a.bonus_status,a.normal_status,a.actual_amount,a.withdraw_way,a.ip from withdraw_order a left join members b on a.member_id=b.id left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join agency_team d on b.agency_team_id=d.id left join members_card e on b.id=e.member_id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
        let dataList = await query(sql, [Number(data.skip), Number(data.limit)])
        var i = 0
        for (i = 0; i < dataList.length; i++) {//風控 確認IP是否在黑名單內
            var sql2 = 'SELECT * FROM `whitelist` where ip=? and status="refuse"'
            let dataList2 = await query(sql2, [dataList[i].ip])
            if (dataList2.length > 0) {
                dataList[i].risk = "X"
            } else {
                dataList[i].risk = "V"
            }
        }
        return dataList
    }
    async withdrawListTotal(conditionData) {
        let sql = 'SELECT count(*) as total from withdraw_order a left join members b on a.member_id=b.id '
        let dataList = await query(sql)

        const total = Math.ceil(Number(dataList[0].total) / Number(conditionData.limit))//最大頁數
        return total
    }
    checkWithdraw(data) {
        let sql = "select * from withdraw_order where id=? and status='pending'"
        let dataList = query(sql, [data])
        return dataList
    }
    updateWithdraw(data) {
        let sql = "update withdraw_order set status=?,actual_amount=? where id=?"
        let dataList = query(sql, [data.status, data.actual_amount, data.id])
        return dataList
    }
    withdrawData(data) {
        let sql = "select * from withdraw_order where id=?"
        let dataList = query(sql, [data])
        return dataList
    }
    selectDepositInfo(data) {//查看是否為黑名單
        let sql = 'SELECT * FROM `deposit_info` order by id ASC'
        let dataList = query(sql)
        return dataList
    }
    checkDepositInfo(data) {//存款方式設定確認
        let sql = 'SELECT * FROM `deposit_info` where id=?'
        let dataList = query(sql, [data])
        return dataList
    }
    updateDepositInfo(data, id) {//更新存款方式設定
        let sql = 'update `deposit_info` set ? where id=?'
        let dataList = query(sql, [data, id])
        return dataList
    }

    depositPagesList(data) {
        let sql = 'SELECT * FROM `deposit_pages` where category=? order by id ASC'
        var depositPagesLists = query(sql, [data])
        return depositPagesLists
    }
     checkDepositPage(data) {
        let sql = 'SELECT * FROM `deposit_pages` where id=?'
        let dataList = query(sql, [data])
        return dataList
    }
}

