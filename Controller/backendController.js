const { query } = require('../async-db')
const { check, validationResult } = require('express-validator')
var geoip = require('geoip-lite');
var moment = require('moment'); // require
const backendController = {
    login: async (req, res) => {//後台登入
        const errors = validationResult(req)
        if (!errors.isEmpty()) {//是否有正確填寫欄位值
            const error_msg = errorMessage(errors)//取得錯誤訊息
            return res.json({//回傳失敗訊息
                code: 401,
                msg: "登入失敗",
                data: error_msg
            });
        } else {
        const data = {
            account: req.body.account,
            pwd: req.body.pwd,
        }
        const members = await SelectMembers(data)//查看是否登入成功
        var ip=req.ip//ip
        ip = ip.toString().replace('::ffff:', ''); //
        var geo = geoip.lookup(ip);//ip 分析
        if (members.length <= 0) {
            const membersStatus = await SelectMembersStatus(data)//查看帳號狀態
            if (membersStatus.length > 0) {
                const dataLog = {
                    account: req.body.account,
                    name: membersStatus[0].name,
                    status: "停用",
                    country: geo.country,
                    ip: ip,
                    terrace: req.headers['user-agent']
                }
                const dataLog2 = {
                    account: req.body.account,
                    log: "Login failed",
                    ip: ip,
                    Updateuser: req.body.account
                }
                await Login_log(dataLog,dataLog2)
                req.session.destroy();//清除Session
                return res.json({//回傳失敗訊息
                    code: 401,
                    msg: "登入失敗",
                    data: "帳號為停用狀態"
                });
            } else {
                var geo = geoip.lookup(ip);
                
                const dataLog = {
                    account: req.body.account,
                    name: "",
                    status: "帳號密碼錯誤",
                    country: geo.country,
                    ip: ip,
                    terrace: req.headers['user-agent']
                }
                const dataLog2 = {
                    account: req.body.account,
                    log: "Login failed",
                    ip: ip,
                    Updateuser: req.body.account
                }
                await Login_log(dataLog,dataLog2)
                req.session.destroy();//清除Session
                return res.json({//回傳失敗訊息
                    code: 401,
                    msg: "登入失敗",
                    data: "帳號密碼錯誤"
                });
            }
        } else {
            const membersStatus = await SelectMembersStatus(data)//查看帳號狀態
            const dataLog = {
                account: req.body.account,
                name: membersStatus[0].name,
                status: "登入成功",
                country: geo.country,
                ip: ip,
                terrace: req.headers['user-agent']
            }
            const dataLog2 = {
                account: req.body.account,
                log: "Login Successful(loginip:"+ip+")",
                ip: ip,
                Updateuser: req.body.account
            }
            await Login_log(dataLog,dataLog2)
            
            const dataLogin = {
                last_time: moment().format('YYYY-MM-DD hh:mm:ss'),
                last_ip: ip
            }
            await managementLogin(dataLogin,req.body.account)
            req.session.adminInfo=req.body.account
            req.session.adminName=req.body.name
            return res.json({//回傳成功
                code: 200,
                msg: "登入成功",
                data: members
            });
        }

    }}

}



function errorMessage(errors) {//錯誤訊息回傳
    let errorrmsg = errors.array();
    let emsg = "";
    errorrmsg.forEach(function (erow, i) {//錯誤訊息
        emsg = emsg + erow.msg + " ";
    })
    return emsg
}

function SelectMembers(data) {//找尋Member
    let sql = 'select * from backend_admin where account=? and pwd=? and status="enable"'
    let dataList = query(sql, [data.account, data.pwd])
    return dataList
}
function SelectMembersStatus(data) {//找尋Member
    let sql = 'select name,status from backend_admin where account=? and pwd=? '
    let dataList = query(sql, [data.account, data.pwd])
    return dataList
}

function Login_log(data,data2) {//登入失敗紀錄LOG
    let sql = 'INSERT INTO backend_login_log SET ?'
    let dataList = query(sql, data)

    
    let sql2 = 'INSERT INTO backend_log SET ?'
    let dataList2 = query(sql2, data2)
    return dataList
}




function managementLogin(data,data2) {//登入時間 ip 更新
    let sql = 'update backend_admin SET ? where account=?'
    let dataList = query(sql, [data,data2])
    return dataList
}
module.exports = backendController;