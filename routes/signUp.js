const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")
const { nanoid } = require('nanoid');
const e = require("express");

router.get('/', async({ cookies, query: { action , needID, resumeID } }, res) => {
    let response = { state: "unknownError", data: {} }
    try{        
        await executeSql(`begin;`)
        if(action == "signUp"){
            if(cookies.loginState!="student"||!cookies.student)  throw "identityErr"
            let [need] = await executeSql(`SELECT \`state\`,\`numberOfSignUp\`,\`signedUp\` FROM \`need\` WHERE \`needID\`="${needID}"`)
            if(!need||need.state!='signUp'||need.numberOfSignUp<=need.signedUp) throw "needErr"
            let [signUpState] = await executeSql(`SELECT \`signUpState\`FROM \`student\`,\`signup\` WHERE \`needID\`="${needID}" AND \`userID\`="${cookies.student}" AND \`student\`.\`studentID\`=\`signup\`.\`studentID\`;`)
            if(signUpState&&signUpState["signUpState"]) throw "haveSignedUpErr"
            let [studentID] = await executeSql(`SELECT \`student\`.\`studentID\` FROM \`resume\`,\`student\` WHERE\`resumeID\`= "${resumeID}" AND \`student\`.\`studentID\`=\`resume\`.\`studentID\` AND \`student\`.\`userID\`="${cookies.student}";`)
            if(!studentID||!studentID.studentID) throw "signUp:resumeErr"
            if(need.numberOfSignUp-need.signedUp==1){
                await executeSql(`UPDATE \`need\` SET \`signedUp\`=${need.signedUp+1} AND \`state\`=\`stop\` WHERE \`needID\`="${needID}"`)
            }
            else{
                await executeSql(`UPDATE \`need\` SET \`signedUp\`=${need.signedUp+1} WHERE \`needID\`="${needID}";`)
            }
            await executeSql(`INSERT INTO \`signup\`VALUES("${needID}","${studentID.studentID}","wait","${resumeID}") ;`)
            await executeSql(`commit;`)
            response = {
                state: "success",
                data: {}
            }
        } else throw "actionErr"
    } catch(err) {
        await executeSql(`rollback;`)
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
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
        if(action == "signUp"){
            
        } else if (action = ""){

        } else throw "actionErr"
        await executeSql(`commit;`)
    } catch(err) {
        await executeSql(`rollback;`)
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
    } finally {
        res.send(response);
    }
})

module.exports = router;