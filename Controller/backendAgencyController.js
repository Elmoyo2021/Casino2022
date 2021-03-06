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
    agencyDetail: async (req, res) => {//代理團隊_下級列表
        const Agencys = await checkAgencyId(req.query.id)
        let agencyRt = {}
            layer = await countLayer(req.query.id)
            members = await countMembers(req.query.id)
            agencyRt={
                account:Agencys[0].account,
                rank:Agencys[0].rank,
                name:Agencys[0].name,
                settlement:Agencys[0].settlement,
                Createtime:Agencys[0].Createtime,
                agencyTotal:layer[0].total,
                memberTotal:members[0].total,
                point:Agencys[0].point,
                status:Agencys[0].statusAgencys,
                Updatetime:Agencys[0].Updatetime
            }
        const AgencyLowers = await checkAgencyLower(req.query.id)
        let AgencyLowersRt = []
        let agencyInsert = {}
        for (i = 0; i < AgencyLowers.length; i++) {
            layer = await countLayer(AgencyLowers[i].id)
            members = await countMembers(AgencyLowers[i].id)
            agencyInsert={
                account:AgencyLowers[i].account,
                rank:AgencyLowers[i].rank,
                name:AgencyLowers[i].name,
                settlement:AgencyLowers[i].settlement,
                Createtime:AgencyLowers[i].Createtime,
                agencyTotal:layer[i].total,
                memberTotal:members[i].total,
                point:AgencyLowers[i].point,
                status:AgencyLowers[i].statusAgencys,
                Updatetime:AgencyLowers[i].Updatetime
            }
            AgencyLowersRt.push(agencyInsert)
        }

        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: {
                agency: agencyRt,
                lower_list: AgencyLowersRt
            }
        });
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
            
            const InsertData=req.body
            const agencyAdd = await agencyMemberInsert(InsertData)//寫入資料庫
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
            const UpdateData=req.body
            delete UpdateData.id
            const agencyTeamAdd = await agencyTeamUpdate(UpdateData, req.body.id)//寫入資料庫
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
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: finalRt
        });
    },
    agencyAccounted: async (req, res) => {

        const agencyLists = await agencyReportList()
        let finalRt = []
        let agencyListInsert = {}
        for (i = 0; i < agencyLists.length; i++) {
            members = await countMembers(agencyLists[i].id)
            bets = await countBets(agencyLists[i].id)
            profits = await countProfit(agencyLists[i].id)
            betAmounts = await countBetAmounts(agencyLists[i].id)
            betProfits = await countProfits(agencyLists[i].id)
            var accounteds = 0, totals = 0
            accounteds = Number(betProfits[0].total) * 0.1
            totals = accounteds
            agencyListInsert = {
                account: agencyLists[i].account,
                rank: agencyLists[i].rank,
                members_count: members[0].total,
                bet_total: bets[0].total,
                bet_amount: betAmounts[0].total,
                bet_amount_efficient: betProfits[0].total,
                profit: profits[0].total,
                accounted: accounteds,
                layer_bonus: 0,
                total: totals,
            }
            finalRt.push(agencyListInsert)
            //console.log(agencyLists[i].account)
        }
        return res.json({//回傳成功
            code: 200,
            msg: "成功",
            data: finalRt
        });
    },
    agencyPointLog: async (req, res) => {
        const conditionData = pagination(req) //分頁設定
        const agencyPointLogs = await agencyPointLog(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const agencyPointLogTotals = await agencyPointLogTotal()//資料總筆數
        const total = Math.ceil(Number(agencyPointLogTotals[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: agencyPointLogs
            }
        });

    },
    agencyApplyList: async (req, res) => {
        const conditionData = pagination(req) //分頁設定
        const agencyApplyLists = await agencyApplyList(conditionData)//呼叫會員列表 傳入排序分頁等設定
        const agencyApplyListTotals = await agencyApplyListTotal()//資料總筆數
        const total = Math.ceil(Number(agencyApplyListTotals[0].total) / Number(conditionData.limit))//最大頁數
        return res.json({//回傳成功
            code: 200,
            msg: "回傳成功",
            data: {
                total: total,//最大頁數
                list: agencyApplyLists
            }
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



function checkAgencyId(data) {//代理團隊列表
    let sql = 'SELECT account,rank,name,settlement,Createtime,point,status,Updatetime FROM `agency_team` where id=?'
    let dataList = query(sql, [data])
    return dataList
}
function checkAgencyLower(data) {//代理團隊列表_下級
    let sql = 'SELECT * FROM `agency_team` where layer_id=?'
    let dataList = query(sql, [data])
    return dataList
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


function agencyApplyList(data) {//代理團隊列表
    let sql = 'SELECT * FROM `agency_apply` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function agencyApplyListTotal() {//代理團隊列表總數
    let sql = 'SELECT count(*) as total FROM `agency_apply` '
    let dataList = query(sql)
    return dataList
}


function agencyPointLog(data) {//代理團隊列表
    let sql = 'SELECT * FROM `agency_point_log` order by ' + data.orderBy + ' ' + data.order + ' limit ?,?'
    let dataList = query(sql, [Number(data.skip), Number(data.limit)])
    return dataList
}

function agencyPointLogTotal() {//代理團隊列表總數
    let sql = 'SELECT count(*) as total FROM `agency_point_log` '
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


module.exports = AgencyController;