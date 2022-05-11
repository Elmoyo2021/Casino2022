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
        let finalRt = []
        let agencyListInsert = {}
        for (i = 0; i < agencyLists.length; i++) {
            layer = await countLayer(agencyLists[i].id)
            members_register = await countMembersRe(agencyLists[i].id)
            members = await countMembers(agencyLists[i].id)
            bets = await countBets(agencyLists[i].id)
            profits = await countProfit(agencyLists[i].id)
            deposits = await countDeposits(agencyLists[i].id)
            depositMembers = await countDepositMembers(agencyLists[i].id)
            depositAmounts = await countDepositAmounts(agencyLists[i].id)
            withdrawalAmounts = await countWithdrawalAmounts(agencyLists[i].id)
            betAmounts = await countBetAmounts(agencyLists[i].id)
            betProfits = await countProfits(agencyLists[i].id)

            agencyListInsert = {
                rank: agencyLists[i].rank,
                account: agencyLists[i].account,
                layer_count: layer[0].total,//下線代理數
                members_register_count: members_register[0].total,
                members_count: members[0].total,
                bet_total: bets[0].total,
                deposit_total: deposits[0].total,
                deposit_members_total: depositMembers[0].total,
                deposit_amount: depositAmounts[0].total,
                withdrawal_amount: withdrawalAmounts[0].total,
                bet_amount: betAmounts[0].total,
                bet_amount_efficient: betProfits[0].total,
                profit: profits[0].total
            }
            finalRt.push(agencyListInsert)
            //console.log(agencyLists[i].account)
        }
        console.log(finalRt)
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: finalRt
        });
    }


}

function countLayer(data) {
    let sql = 'SELECT count(*) as total FROM `agency_team` where layer_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function agencyReportList(data) {//
    let sql = 'SELECT * FROM `agency_team` '
    let dataList = query(sql)
    return dataList
}
function countMembersRe(data) {//
    let sql = 'SELECT count(*) as total FROM `members` where agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countMembers(data) {//
    let sql = 'SELECT count(*) as total FROM `members` where agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countBets(data) {//
    let sql = 'select count(*) as total from (SELECT a.member_id,b.agency_team_id FROM `baccarat_bet`  a left join members b on a.member_id=b.id where b.agency_team_id=? group by member_id) as a'
    let dataList = query(sql, [data])
    return dataList
}
function countBetAmounts(data) {//
    let sql = 'SELECT sum(bet_amount) as total FROM `baccarat_bet`  a left join members b on a.member_id=b.id where b.agency_team_id=? group by member_id'
    let dataList = query(sql, [data])
    return dataList
}
function countProfits(data) {//
    let sql = 'SELECT sum(a.profit) as total FROM `baccarat_bet`  a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}

function countProfit(data) {//
    let sql = 'SELECT sum(a.profit) as total FROM `baccarat_bet` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countDeposits(data) {//
    let sql = 'SELECT count(*) as total FROM `deposit_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countDepositMembers(data) {//
    let sql = 'select count(*) as total from (SELECT member_id FROM `deposit_order` a left join members b on a.member_id=b.id  where b.agency_team_id=? group by a.member_id) as a'
    let dataList = query(sql, [data])
    return dataList
}
function countDepositAmounts(data) {//
    let sql = 'SELECT sum(a.amount) as total FROM `deposit_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
    return dataList
}
function countWithdrawalAmounts(data) {//
    let sql = 'SELECT sum(a.amount) as total FROM `withdraw_order` a left join members b on a.member_id=b.id where b.agency_team_id=?'
    let dataList = query(sql, [data])
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

/********* */


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

function betHistoryList(data) {//有效投注列表
    let sql = "select a.sdate,a.finishtime,a.order_id,a.game_id,d.name as game_name,e.name as systeam,c.name as hierarchy,b.teacher_id,b.account,a.bet_amount,a.bet_amount,a.profit from baccarat_bet a left join members b on a.member_id=b.id  left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join game_list d on a.game=d.id left join game_system e on d.game_system_id=e.id order by a." + data.orderBy + " " + data.order + " limit ?,?"
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}
function betHistoryTotal(data) {//有效投注總數
    let sql = 'select count(*) as total from baccarat_bet a left join members b on a.member_id=b.id  left join hierarchy_detail c on b.hierarchy_detail_id=c.id left join game_list d on a.game=d.id left join game_system e on d.game_system_id=e.id '
    let dataList = query(sql)
    return dataList
}


function whiteListInsert(data) {//寫入backend_whitelist資料庫
    let sql = 'INSERT INTO backend_whitelist SET ?'
    let dataList = query(sql, data)
    return dataList
}

function whiteListUpdate(data,id) {//更新backend_whitelist資料庫
    let sql = 'update backend_whitelist SET ? where id=?'
    let dataList = query(sql, [data,id])
    return dataList
}
function whiteListDel(id) {//刪除backend_whitelist資料庫
    let sql = 'delete from backend_whitelist  where id=?'
    let dataList = query(sql, [id])
    return dataList
}
function whiteListInsertRt(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where id=?'
    let dataList = query(sql, [data])
    return dataList
}

function SelectListCheck(data) {//查看backend_whitelist
    let sql = 'SELECT * FROM `backend_whitelist` where ip=?'
    let dataList = query(sql, [data])
    return dataList
}

module.exports = AgencyController;