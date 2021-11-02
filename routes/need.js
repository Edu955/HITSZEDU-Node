const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")
const { nanoid } = require('nanoid')

router.get('/', async({ cookies, query: { action , id , type} }, res) => {
    let response = { state: "unknownError", data: {} }
    try{        
        if(action == "getNeeds"){
            let needs;
            if(type=='workStudy'||type=='publicBenefit'||type=='course') {
                needs = await executeSql(`SELECT \`needID\`,\`title\`,\`time\`,\`publishTime\`,\`type\`,\`publisherName\`,\`addressDescription\`FROM \`need\`,\`address\` WHERE \`need\`.\`addressID\`= \`address\`.\`addressID\` AND \`state\`='signUp' AND \`type\`="${type}" ORDER BY \`publishTime\` DESC limit 64;`)
            }
            else needs = await executeSql(`SELECT \`needID\`,\`title\`,\`time\`,\`publishTime\`,\`type\`,\`publisherName\`,\`addressDescription\`FROM \`need\`,\`address\` WHERE \`need\`.\`addressID\`= \`address\`.\`addressID\` AND \`state\`='signUp' ORDER BY \`publishTime\` DESC limit 64;`)
            response = {
                state: "success",
                data: needs
            }
        } else if(action == "getNeed"){
            if(!id) throw "need:noNeedIDErr";
            let [need] = await executeSql(`SELECT * FROM \`need\`,\`address\` WHERE \`need\`.\`addressID\`= \`address\`.\`addressID\` AND \`needID\`="${id}"`)
            if(!need) throw "need:notExistErr";
            delete(need.userID)
            delete(need.adminID)
            if(cookies.loginState=="student"&&cookies.student){
                let [signUpState] = await executeSql(`SELECT \`signUpState\`FROM \`student\`,\`signup\` WHERE \`needID\`="${id}" AND \`userID\`="${cookies.student}" AND \`student\`.\`studentID\`=\`signup\`.\`studentID\`;`)
                if(signUpState&&signUpState["signUpState"]){
                    response = {
                        state: "success",
                        data: {need,myState:signUpState["signUpState"]}
                    }
                } else {
                    response = {
                        state: "success",
                        data: {need,myState:"notSignUp"}
                    }
                }
            } else {
                response = {
                    state: "success",
                    data: {need}
                }
            }
        } else if(action == "getMyNeeds"){
            let needs;
            if(cookies.loginState=="admin"&&cookies.admin){
                switch(type){
                case"publisher":
                  needs = await executeSql(`SELECT \`needID\`,\`title\`,\`time\`,\`publishTime\`,\`type\`,\`publisherName\`,\`addressDescription\`FROM \`need\`,\`address\` WHERE \`userID\`="${cookies.admin}" AND \`need\`.\`addressID\`= \`address\`.\`addressID\` ORDER BY \`publishTime\` DESC;`)
                  break;
                case"reviewer":
                  needs = await executeSql(`SELECT \`needID\`,\`title\`,\`time\`,\`publishTime\`,\`type\`,\`publisherName\`,\`addressDescription\`FROM \`need\`,\`address\`,\`admin\` WHERE \`admin\`.\`userID\`="${cookies.admin}" AND \`need\`.\`adminID\`=\`admin\`.\`adminID\` AND \`need\`.\`addressID\`= \`address\`.\`addressID\` ORDER BY \`publishTime\` DESC;`)
                  break;
                case"waitForReview":
                  needs = []
                  break;
                }
            } else if (cookies.loginState=="student"&&cookies.student){
                needs = await executeSql(`SELECT \`need\`.\`needID\`,\`title\`,\`time\`,\`publishTime\`,\`type\`,\`publisherName\`,\`addressDescription\`FROM \`need\`,\`address\`,\`signup\`,\`student\` WHERE \`need\`.\`addressID\`= \`address\`.\`addressID\` AND \`need\`.\`needID\`=\`signup\`.\`needID\` and \`signup\`.\`studentID\`=\`student\`.\`studentID\` and \`student\`.\`userID\`="${cookies.student}" and \`signUpState\`="${type}" ORDER BY \`publishTime\` DESC;`)
                
            } else throw "identityErr"
            response = {
                state: "success",
                data: needs
            }
        }  else throw "actionErr"
    } catch(err) {
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
        else response = {state:"unknownError",data: {}}
    } finally {
        res.send(response);
    }
})

router.post('/', async({ cookies, body: { action, data } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{     
        await executeSql(`begin;`)
        if(cookies.loginState!="admin"||!cookies.admin)  throw "identityErr"
        let [admin] = await executeSql(`SELECT \`adminID\` FROM \`admin\` WHERE \`userID\`="${cookies.admin}";`)
        if(!admin) throw "identityErr"
        if(action == "addNeed"){
            if(data.type!="workStudy"&&data.type!="publicBenefit"&&data.type!="course") throw "need:typeErr"
            let needID=nanoid();
            let addressID=nanoid();  
            let time = new Date().getTime();//时间戳会被mysql触发器覆盖
            await executeSql(`INSERT INTO \`address\` VALUES("${addressID}","${data.addressName}","${data.longtitude}","${data.latitude}","${data.addressDescription}");`)
            await executeSql(`INSERT INTO \`need\` VALUES("${needID}","${cookies.admin}","${addressID}","${admin.adminID}","${data.type}","${data.time}","${data.title}","${data.description}","${data.reward}",${data.numberOfSignUp},${time},"${data.publisherName}","signUp",0);`)
        } else throw "actionErr"
        await executeSql(`commit;`)
        response = {
            state: "success",
            data: {}
        }
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