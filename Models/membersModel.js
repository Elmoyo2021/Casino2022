const { query } = require('../async-db')
var moment = require('moment'); // require
const fs = require('fs')
const public = require('../Models/public');//共用function
publics = new public();

module.exports = class CheckCustomer {
  //判斷email格式
  async memberCheck(memberData) {
    let sql = "select * from members where account=? and pwd=?"
    let dataList = await query(sql, [memberData.account, memberData.pwd])
    return dataList;
  }

  memberList(data) {//會員列表
    let sql = "select a.id,a.account,a.name,b.name as group_title,a.currency,c.title tagsTitle,a.agency_team_id,a.teacher_code,a.email,a.phone,a.sms_check,a.IM1,a.IM2,a.city,a.bank_account,a.Createtime from members as a left join hierarchy_detail as b on a.hierarchy_detail_id=b.id left join tags as c on a.tags=c.id  order by a." + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
  }
  memberListTotal() {//會員列表總數
    let sql = 'SELECT count(*) as total FROM `members` '
    let dataList = query(sql)
    return dataList
  }
}