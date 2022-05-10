const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');

const AgencyController = {
    agencyListAdd: async (req, res) => {//代理團隊 新增
        const Agencys = await checkAgency(req.body.account)//寫入資料庫
        if (Agencys.length > 0) {
            return res.json({//回傳成功
                code: 501,
                msg: "新增失敗",
                data: "代理帳號已存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const agencyData = {//代理資訊
                rank: req.body.rank,
                account: req.body.account,
                name: req.body.name,
                pwd: req.body.pwd,
                hierarchy_detail_id: req.body.hierarchy_detail_id,//會員層級
                phone: req.body.phone,
                layer_id: req.body.layer_id,
                settlement: req.body.settlement,
                currency: req.body.currency,
                acting_deposit: req.body.acting_deposit,
                acting_other: req.body.acting_other,
                acting_rebate: req.body.acting_rebate,
                acting_bonus: req.body.acting_bonus,
                acting_layer_bonus: req.body.acting_layer_bonus,
                acting_platform_cost: req.body.acting_platform_cost,
                proportion_cycle: req.body.proportion_cycle,
                proportion_profit: req.body.proportion_profit,
                proportion_efficient: req.body.proportion_efficient,
                proportion_bet: req.body.proportion_bet,
                proportion_deposit: req.body.proportion_deposit,
                proportion_game: req.body.proportion_game,
                remark: req.body.remark
            }
            const agencyAdd = await agencyTeanInsert(agencyData)//寫入資料庫
            const agencyTeamRts = await agencyTeamRt(agencyAdd.insertId)

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: agencyTeamRts
            });
        }//檢查是否正確欄位填寫END

    },
    agencyListMemberAdd: async (req, res) => {//代理團隊 新增會員

        const Members = await checkMembers(req.body.account)//寫入資料庫
        if (Members.length > 0) {
            return res.json({//回傳成功
                code: 501,
                msg: "新增失敗",
                data: "會員帳號已存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const Data = {//代理 或 會員 資料
                rank: req.body.rank,
                account: req.body.account,
                name: req.body.name,
                pwd: req.body.pwd,
                hierarchy_detail_id: req.body.hierarchy_detail_id,//會員層級
                phone: req.body.phone,
            }
            const agencyAdd = await agencyMemberInsert(Data)//寫入資料庫
            const agencyMemberRts = await agencyMemberRt(agencyAdd.insertId)

            return res.json({//回傳成功
                code: 200,
                msg: "新增成功",
                data: agencyMemberRts
            });
        }//檢查是否正確欄位填寫END

    },
    agencyList: async (req, res) => {//出入款列表
        const conditionData = pagination(req) //分頁設定
        const agencyLists = await agencyList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const agencyListTotals = await agencyListTotal()//資料總筆數
        const total = Math.ceil(Number(agencyListTotals[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: agencyLists
            }
        });

    },
    agencyListUpdate: async (req, res) => {//代理團隊 團隊列表
        const checkGroup = await agencyTeamInsertRt(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "編輯失敗",
                data: "id不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const Data = {
                rank: req.body.rank,
                name: req.body.name,
                pwd: req.body.pwd,
                hierarchy_detail_id: req.body.hierarchy_detail_id,
                phone: req.body.phone,
                remark: req.body.remark,
                layer_id: req.body.layer_id,
                settlement: req.body.settlement,
                currency: req.body.currency,
                acting_deposit: req.body.acting_deposit,
                acting_other: req.body.acting_other,
                acting_rebate: req.body.acting_rebate,
                acting_bonus: req.body.acting_bonus,
                acting_layer_bonus: req.body.acting_layer_bonus,
                acting_platform_cost: req.body.acting_platform_cost,
                proportion_cycle: req.body.proportion_cycle,
                proportion_profit: req.body.proportion_profit,
                proportion_efficient: req.body.proportion_efficient,
                proportion_bet: req.body.proportion_bet,
                proportion_deposit: req.body.proportion_deposit,
                proportion_game: req.body.proportion_game
            }
            const agencyTeamAdd = await agencyTeamUpdate(Data, req.body.id)//寫入資料庫
            const agencyTeamRt = await agencyTeamInsertRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: agencyTeamRt
            });
        }//檢查是否正確欄位填寫END

    },
    agencyListUpdatePoint: async (req, res) => {//代理團隊 點數更改
        const checkGroup = await agencyTeamInsertRt(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "點數更改失敗",
                data: "id不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "點數更改失敗",
                data: error_msg
            });
        } else {
            if (req.body.point_status == 1 && req.body.point_add != '') {//是否為增加點數
                const PointData = {
                    id: req.body.id,
                    method: "+",
                    point: Number(req.body.point_add)
                }
                const agencyTeamAupdate = await agencyTeamPointUpdate(PointData)//更新點數
            } else if (req.body.point_status == 2 && req.body.withdrawal == 'true') {//是否為提領全部點數
                const Points = await selectPoint(req.body.id)//查看現有點數
                const PointData = {
                    id: req.body.id,
                    method: "-",
                    point: Number(Points[0].point)
                }
                const agencyTeamAupdate = await agencyTeamPointUpdate(PointData)//更新點數
            } else if (req.body.point_status == 2 && req.body.withdrawal == '') {//是否為提領部分點數

                const Points = await selectPoint(req.body.id)//查看現有點數
                const PointData = {
                    id: req.body.id,
                    method: "-",
                    point: Number(req.body.point_withdrawal)
                }
                if (Number(Points[0].point) < Number(req.body.point_withdrawal)) {
                    return res.json({//回傳失敗
                        code: 401,
                        msg: "剩餘點數不足",
                        data: ""
                    });
                } else {
                    const agencyTeamAupdate = await agencyTeamPointUpdate(PointData)//更新點數
                }
            } else {
                return res.json({//回傳失敗
                    code: 401,
                    msg: "修改失敗參數有誤",
                    data: ""
                });
            }
            const agencyTeamRt = await agencyTeamInsertRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: agencyTeamRt
            });
        }//檢查是否正確欄位填寫END

    },
    agencyListUpdateStatus: async (req, res) => {//代理團隊 狀態更改
        const checkGroup = await agencyTeamInsertRt(req.body.id)
        if (checkGroup.length <= 0) {
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "編輯失敗",
                data: "id不存在"
            });
        }
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "新增失敗",
                data: error_msg
            });
        } else {
            const Data = {
                status: req.body.status
            }
            const agencyTeamAdd = await agencyTeamUpdate(Data, req.body.id)//寫入資料庫
            const agencyTeamRt = await agencyTeamInsertRt(req.body.id)//回傳成功表

            return res.json({//回傳成功
                code: 200,
                msg: "修改成功",
                data: agencyTeamRt
            });
        }//檢查是否正確欄位填寫END

    },
    agencyReport: async (req, res) => {
        
        const agencyLists = await agencyReportList()
        let finalRt={}
        let agencyListInsert={}
        for(i=0;i<agencyLists.length;i++){
            agencyListInsert={
                rank:agencyLists[i].rank,
                account:agencyLists[i].account
            }
            finalRt.push(finalRt)
            //console.log(agencyLists[i].account)
        }
        console.log(finalRt)
        return res.json({//回傳成功
            code: 200,
            msg: "修改成功",
            data: agencyLists
        });
        
    }


}


function agencyReportList(data) {//確認團隊帳號是否存在
    let sql = 'SELECT * FROM `agency_team` '
    let dataList = query(sql)
    return dataList
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


function agencyList(data) {//代理團隊列表
    let sql = 'SELECT * FROM `agency_team` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function agencyListTotal() {//代理團隊列表總數
    let sql = 'SELECT count(*) as total FROM `agency_team` '
    let dataList = query(sql)
    return dataList
}

function checkMembers(data) {//確認會員帳號是否存在
    let sql = 'SELECT * FROM `members` where account=?'
    let dataList = query(sql, [data])
    return dataList
}

function checkAgency(data) {//確認團隊帳號是否存在
    let sql = 'SELECT * FROM `agency_team` where account=?'
    let dataList = query(sql, [data])
    return dataList
}
function agencyTeanInsert(data) {//寫入agency_team資料庫
    let sql = 'INSERT INTO agency_team SET ?'
    let dataList = query(sql, data)
    return dataList
}

function agencyTeamRt(data) {//代理團隊列表總數
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function agencyMemberRt(data) {//代理團隊列表總數
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function agencyMemberInsert(data) {//寫入agency_team資料庫
    let sql = 'INSERT INTO members SET ?'
    let dataList = query(sql, data)
    return dataList
}
function agencyTeamUpdate(data, data2) {//寫入agency_team資料庫
    let sql = 'update agency_team set ? where id=?'
    let dataList = query(sql, [data, data2])
    return dataList
}
function agencyTeamPointUpdate(data) {//更新點數 agency_team資料庫
    let sql = 'update agency_team set point=point' + data.method + '? where id=?'
    let dataList = query(sql, [data.point, data.id])
    return dataList
}
function agencyTeamInsertRt(data) {//查看agency_list
    let sql = 'SELECT * FROM `agency_team` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function selectPoint(data) {//查看現有點數
    let sql = 'SELECT point FROM `agency_team` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
//XXXXXXXXXXXXXXXXXXXXXXXXX
function checkWithdraw(data) {
    let sql = "select * from withdraw_order where id=? and status='pending'"
    let dataList = query(sql, [data])
    return dataList
}
function checkWithdrawRt(data) {
    let sql = "select * from withdraw_order where id=? "
    let dataList = query(sql, [data])
    return dataList
}
function updateWithdraw(data) {
    let sql = "update withdraw_order set status=?,actual_amount=? where id=?"
    let dataList = query(sql, [data.status, data.actual_amount, data.id])
    return dataList
}



function depositList(data) {
    let sql = 'SELECT a.id,a.Createtime,a.postscript,c.name,d.name,b.account,b.name,a.deposit_type,a.remark,a.amount,a.pay_amount,e.title as pay_info,a.status FROM deposit_order a left join members b on a.member_id=b.id left join agency_team c on b.agency_team_id=c.id left join hierarchy_detail d on b.hierarchy_detail_id=d.id left join third_platform e on a.aisle=e.id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function depositListTotal(data) {
    let sql = 'SELECT count(*) as total from deposit_order'
    let dataList = query(sql)
    return dataList
}

function checkDepositId(data) {
    let sql = "select * from deposit_order where id=?"
    let dataList = query(sql, [data])
    return dataList
}
function checkMembers(data) {
    let sql = "select a.account,a.name,a.Createtime,b.name as hierarchy_detail from members a left join hierarchy_detail b on a.hierarchy_detail_id=b.id where a.id=?"
    let dataList = query(sql, [data])
    return dataList
}
function withdrawList(data) {
    let sql = 'SELECT a.id,a.Createtime,d.name as agency_team,c.name as hierarchy,b.account,b.name,b.tags,e.bank,e.account as bank_account,e.name as bank_name,a.amount as withdraw_amount,a.status,a.bonus_status,a.normal_status,a.actual_amount,a.withdraw_way,a.ip from withdraw_order a left join members b on a.member_id=b.id left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join agency_team d on b.agency_team_id=d.id left join members_card e on b.id=e.member_id order by a.' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}


function depositLimitList(data) {
    let sql = 'SELECT * from deposit_limit where depostit_group=?'
    let dataList = query(sql, [data])
    return dataList
}


function withdrawListTotal(data) {
    let sql = 'SELECT count(*) as total from withdraw_order a left join members b on a.member_id=b.id '
    let dataList = query(sql)
    return dataList
}
function financeAccount(data) {//出入款銀行列表
    let sql = 'SELECT bank,title_cn,bank_type,account,currency,vip_level,deposit_max_day,deposit_max_total,status,dispensing_status,balance_min,remark FROM `finance_account` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function financeAccountTotal() {//出入款銀行列表總數
    let sql = 'SELECT count(*) as total FROM `finance_account` '
    let dataList = query(sql)
    return dataList
}


function walletLog(data) {//錢包出入列表
    let sql = 'SELECT * FROM `wallet_transfer_log` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function walletLogTotal() {//錢包出入總數
    let sql = 'SELECT count(*) as total FROM `wallet_transfer_log` '
    let dataList = query(sql)
    return dataList
}


function bankList(data) {//銀行列表
    let sql = 'SELECT * FROM `finance_bank` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function bankListTotal() {//銀行列表總數
    let sql = 'SELECT count(*) as total FROM `finance_bank` '
    let dataList = query(sql)
    return dataList
}

function financeInsert(data) {//寫入finance_account資料庫
    let sql = 'INSERT INTO finance_account SET ?'
    let dataList = query(sql, data)
    return dataList
}
function financesInsertRt(data) {//查看finance_account
    let sql = 'SELECT * FROM `finance_account` where id=?'
    let dataList = query(sql, [data])
    return dataList
}




function bankListInsert(data) {//寫入 finance_bank 資料庫
    let sql = 'INSERT INTO finance_bank SET ?'
    let dataList = query(sql, data)
    return dataList
}
function bankListsInsertRt(data) {//查看finance_account
    let sql = 'SELECT * FROM `finance_bank` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


function bankListUpdate(data, id) {//更新 finance_bank 資料庫
    let sql = 'update finance_bank SET ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}



function thirdPlatform(data) {//第三方平台列表
    let sql = 'SELECT * FROM `third_platform` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function thirdPlatformTotal() {//第三方平台列表總數
    let sql = 'SELECT count(*) as total FROM `third_platform` '
    let dataList = query(sql)
    return dataList
}


function thirdPlatformUpdate(data) {//寫入 third_platform 資料庫
    let sql = 'INSERT INTO third_platform SET ?'
    let dataList = query(sql, data)
    return dataList
}

function thirdPlatformInsert(data) {//寫入 third_platform 資料庫
    let sql = 'INSERT INTO third_platform SET ?'
    let dataList = query(sql, data)
    return dataList
}
function thirdPlatformInsertRt(data) {//查看third_platform
    let sql = 'SELECT * FROM `third_platform` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};



function checkIPList(data) {//查看是否為黑名單
    let sql = 'SELECT * FROM `whitelist` where ip=? and status="refuse"'
    let dataList = query(sql, [data])
    return dataList
}


function selectDepositInfo(data) {//查看是否為黑名單
    let sql = 'SELECT * FROM `deposit_info` order by id ASC'
    let dataList = query(sql)
    return dataList
}

function updateDepositInfo(data, id) {//更新存款方式設定
    let sql = 'update `deposit_info` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositListRemark(data) {
    let sql = 'SELECT * FROM `deposit_order` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function updateDepositListRemark(data, id) {
    let sql = 'update `deposit_order` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositInfo(data) {//存款方式設定確認
    let sql = 'SELECT * FROM `deposit_info` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function depositPagesListGroup() {
    let sql = 'SELECT * FROM `deposit_pages` group by bank order by id ASC'
    let dataList = query(sql)
    return dataList
}
function depositPagesList(data) {
    let sql = 'SELECT * FROM `deposit_pages` where bank=? order by id ASC'
    let dataList = query(sql, [data])
    return dataList
}

function updateDepositPages(data, id) {//更新存款方式設定
    let sql = 'update `deposit_pages` set ? where id=?'
    let dataList = query(sql, [data, id])
    return dataList
}
function checkDepositPages(data) {
    let sql = 'SELECT * FROM `deposit_pages` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function selectMembers(data) {
    let sql = 'SELECT * FROM `members` where id=?'
    let dataList = query(sql, [data])
    return dataList
}


module.exports = AgencyController;