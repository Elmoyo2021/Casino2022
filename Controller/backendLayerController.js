const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

var moment = require('moment'); // require

const fs = require('fs')


const leyerController = {
    layerList: async (req, res) => {//老帶新列表
        const conditionData = pagination(req) //分頁設定
        const layerLists = await layerList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const layerListTotals = await layerListTotal()//資料總筆數
        const total = Math.ceil(Number(layerListTotals[0].total) / Number(conditionData.limit))//最大頁數

        var layerListRt = []
        var layerListDetail = []
        var teacher_accounts = ""
        var teacher_accountTitle = ""
        for (i = 0; i < layerLists.length; i++) {
            teacher_accounts = await selectLayerAccount(layerLists[i].teacher_id)//查看會員資料
            teacher_accountTitle = ""
            if (teacher_accounts.length > 0) {//判斷是否有上層會員帳號
                teacher_accountTitle = teacher_accounts[0].account
            }
            //console.log(teacher_accounts[0].account)
            layerListDetail = {
                teacher_code: layerLists[i].teacher_code,//老待新代碼
                account: layerLists[i].account,//會員帳號
                hierarchy_name: layerLists[i].hierarchy_name,//層級組別
                name: layerLists[i].name,//會員姓名
                teacher_id: layerLists[i].teacher_id,//上層會員id
                teacher_account: teacher_accountTitle,//上層會員帳號
                t_total: layerLists[i].t_total,//直屬下線數
                t_total_efficient: layerLists[i].t_total,//有效直屬下線數
                teacher_status: layerLists[i].teacher_status//老待新會員激活狀態

            }
            layerListRt.push(layerListDetail)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: layerListRt
            }
        });
    },
    layerDetail: async (req, res) => {//老帶新信息
        const checkLayers = await selectLayerAccount(req.query.id)
        if (checkLayers <= 0) {
            return res.json({//回傳成功
                code: 501,
                msg: "回傳失敗,老待新i有誤"
            });
        }
        const layerDetails = await layerDetail(req.query.id)//呼叫會員列表 傳入排序分頁等設定
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: layerDetails
        });
    },
    layerDirectly: async (req, res) => {//直屬下線
        const checkLayers = await selectLayerAccount(req.query.id)
        if (checkLayers <= 0) {
            return res.json({//回傳成功
                code: 501,
                msg: "回傳失敗,老待新id有誤"
            });
        }
        const layerDirectlyLists = await layerDirectlyList(req.query.id)//呼叫會員列表 傳入排序分頁等設定
        let layerDirectlyRt = []
        let layerDirectly = []
        let amounts = ""
        let get_bonus = ""
        let bet_effective_amounts = ""
        for (i = 0; i < layerDirectlyLists.length; i++) {
            amounts = await MembersAmount(layerDirectlyLists[i].id)
            bet_effective_amounts = await MembersBetEffective(layerDirectlyLists[i].id)
            layerDirectly = {
                account: layerDirectlyLists[i].account,
                name: layerDirectlyLists[i].name,
                tags_title: layerDirectlyLists[i].tags_title,
                register_ip: layerDirectlyLists[i].Createtime,
                amount: amounts[0].amount,
                bet_effective_amount: bet_effective_amounts[0].amount,
                get_bonus: get_bonus,
                status: layerDirectlyLists[i].status
            }
            layerDirectlyRt.push(layerDirectly)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: layerDirectlyRt
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


function layerList(data) {//老待新列表
    let sql = 'SELECT a.teacher_code,a.account,b.name as hierarchy_name,a.name,a.teacher_id,a.teacher_status,c.t_total FROM `members` a left join hierarchy_detail b on a.hierarchy_detail_id=b.id left join (select teacher_id,count(id) as t_total from members where teacher_id!="" group by teacher_id) c on a.id=c.teacher_id where a.teacher_code!="" order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function layerDetail(data) {//老待新列表
    let sql = 'SELECT a.teacher_code,a.account,a.name,a.status,a.teacher_status,b.name as hierarchy_name,a.teacher_id,a.email,a.phone,a.Createtime,a.Lasttime,a.register_ip,a.ip,a.fingerprint,a.register_fingerprint FROM `members` a left join hierarchy_detail b on a.hierarchy_detail_id=b.id where a.id=?'
    let dataList = query(sql, [data])
    return dataList
}

function layerListTotal() {//老待新列表總數
    let sql = 'SELECT count(*) as total FROM `members` a left join hierarchy_detail b on a.hierarchy_detail_id=b.id where a.teacher_code!=""'
    let dataList = query(sql)
    return dataList
}
async function selectLayerAccount(data) {//查詢會員
    let sql = 'SELECT id,account FROM `members` where id=?'
    let dataList = await query(sql, [data])
    return dataList
}

async function layerDirectlyList(data) {//查詢會員
    let sql = 'SELECT a.id,a.account,a.name,b.title as tags_title,a.Createtime,a.status FROM `members` a left join tags b on a.tags=b.id where a.teacher_id=?'
    let dataList = await query(sql, [data])
    return dataList
}

function MembersAmount(data) {
    let sql = "select id,member_id,sum(amount) as amount from members_wallet where member_id=?"
    let dataList = query(sql, [data])
    return dataList
}


async function MembersBetEffective(data) {
    let sql = "select sum(bet_amount) as amount from bet_detail where member_id=? and status='finsh'"
    let dataList = await query(sql, [data])
    return dataList
}


function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
module.exports = leyerController;