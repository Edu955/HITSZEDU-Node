const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")
const {sevenDays} = require("../utils/constant")

//账号密码登录 action:login
router.post('/', async({ body: { action, data } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{        
        if(action != "login") throw "actionErr"
        if(data.identity !== 'student'&&data.identity !== 'public'&&data.identity !== 'admin') throw "identityErr"
        let result = await executeSql(`SELECT *  FROM \`user\` WHERE \`identity\`= "${data.identity}" AND \`tel\` = "${data.tel}" AND \`password\` = "${data.password}";`)
        if(result.length <= 0) throw("loginFailError")
        // console.log(result)
        let user=result[0]
        res.cookie(user.identity, user.userID,{maxAge: sevenDays})
        res.cookie('loginState', user.identity,{maxAge: sevenDays})
        delete(user.password)
        response = {
            state: "success",
            data: user
        }
    } catch(err) {
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
        else response = {state:"unknownError",data: {}}
    } finally {
        res.send(response);
    }
})

//自动登录 action:autoLogin
router.get('/', async({ cookies, query: { action , targetPort } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{        
        if(action != "login") throw "actionErr"
        let port;
        if(targetPort == 'public'||targetPort == 'student'||targetPort == 'admin'){
            port = targetPort;
        } else {
            port = cookies.loginState;
        }
        let result = await executeSql(`SELECT *  FROM \`user\` WHERE\`userID\`= "${cookies[port]}" AND \`identity\`= "${port}" ;`)
        if(result.length <= 0) throw("loginFailError")
        // console.log(result)
        let user=result[0]
        delete(user.password)
        response = {
            state: "success",
            data: user
        }
        res.cookie(user.identity, user.userID,{maxAge: sevenDays})
        res.cookie('loginState', user.identity,{maxAge: sevenDays})
    } catch(err) {
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
        else response = {state:"unknownError",data: {}}
    } finally {
        res.send(response);
    }
})

module.exports = router;