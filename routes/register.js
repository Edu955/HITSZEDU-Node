const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")
const { nanoid } = require('nanoid')
const {avatar,sevenDays} = require("../utils/constant")

//注册 action:register
router.post('/', async({ body: { action, data } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{        
        await executeSql(`begin;`)
        if(action != "register") throw "actionErr"
        if(data.identity !== 'student'&&data.identity !== 'public'&&data.identity !== 'admin') throw "identityErr"
        let userID = nanoid();
        await executeSql(`INSERT INTO \`user\` VALUES("${userID}","${data.tel}","${avatar}","保密","规格严格，功夫到家~","${data.password}","${data.tel}","normal","${data.identity}");`)
        if(data.identity == 'student') {    //TODO
            await executeSql(`INSERT INTO \`student\` VALUES("${data.authID}","${userID}",null,null,null,null,null,null);`)
            let resumeID = nanoid();
            let onlineResumeID = nanoid();
            await executeSql(`INSERT INTO \`resume\` VALUES("${resumeID}","${data.authID}","默认简历","online");`)
            await executeSql(`INSERT INTO \`onlineresume\` VALUES("${onlineResumeID}","${resumeID}",null,null,null,null,null,null,null);`)
        } else if(data.identity == 'admin') {    //TODO
            await executeSql(`INSERT INTO \`admin\` VALUES("${data.authID}","${userID}");`)
        }
        response = {
            state: "success",
            data: {
                userID,
                nickName: data.tel,
                avatarUrl:avatar,
                gender: "保密",
                motto: "规格严格，功夫到家~",
                tel: data.tel,
                permission: "normal",
                identity: data.identity
            }
        }
        res.cookie(data.identity, userID,{maxAge: sevenDays})
        res.cookie('loginState', data.identity,{maxAge: sevenDays})
        await executeSql(`commit;`)
    } catch(err) {
        await executeSql(`rollback;`)
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
        else response = {state:"unknownError",data: {}}
    } finally {
        res.send(response);
    }
})

module.exports = router;