const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")

//查看自己的简历 action:getMyresume/getResume
router.get('/', async({ cookies, query: { action , id } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{        
        if(action == "getMyResume"){
            if(cookies.loginState!="student"||!cookies.student)  throw "identityErr"
            let [student] = await executeSql(`SELECT *  FROM \`student\` WHERE\`userID\`= "${cookies.student}";`)
            if(!student)  throw "resume:studentNotExistErr"
            let onlineResumes = await executeSql(`SELECT *  FROM \`resume\`,\`onlineresume\`WHERE \`studentID\`= "${student.studentID}" AND \`resume\`.\`resumeID\`=\`onlineresume\`.\`resumeID\`;`)
            let attachedResumes = await executeSql(`SELECT *  FROM \`resume\`,\`attachedresume\`WHERE \`studentID\`= "${student.studentID}" AND \`resume\`.\`resumeID\`=\`attachedresume\`.\`resumeID\`;`)
            if(onlineResumes.length <= 0) throw("resume:noOnlineResumeErr")
            response = {
                state: "success",
                data: {
                    student,
                    onlineResumes,
                    attachedResumes
                }
            }
        } else if (action = "getResume"){
            let [_resume] = await executeSql(`SELECT \`resumeType\`,\`studentID\`  FROM \`resume\` WHERE\`resumeID\`= "${id}";`)
            if(!_resume) throw "resume:resumeNotExistErr"
            if(_resume.resumeType == "online"){
                let [resume] =  await executeSql(`SELECT *  FROM \`resume\`,\`onlineresume\` WHERE \`resume\`.\`resumeID\`=\`onlineresume\`.\`resumeID\` AND \`resume\`.\`resumeID\`= "${id}";`)
                let [student] = await executeSql(`SELECT * FROM \`student\` WHERE \`studentID\`="${_resume.studentID}";`)
                let [user] = await executeSql(`SELECT \`avatarUrl\`,\`gender\`,\`tel\` FROM \`user\` WHERE \`userID\`="${student.userID}";`)
                delete(resume.studentID)
                delete(student.studentID)
                delete(student.userID)
                response={
                    state: "success",
                    data: {
                        resume,
                        student,
                        user
                    }
                }
            } else if (_resume.resumeType == "attached"){                
                let [resume] =  await executeSql(`SELECT *  FROM \`resume\`,\`attachedresume\` WHERE \`resume\`.\`resumeID\`=\`attachedresume\`.\`resumeID\` AND \`resume\`.\`resumeID\`= "${id}";`)
                let [student] = await executeSql(`SELECT * FROM \`student\` WHERE \`studentID\`="${_resume.studentID}";`)
                let [user] = await executeSql(`SELECT \`avatarUrl\`,\`gender\`,\`tel\` FROM \`user\` WHERE \`userID\`="${student.userID}";`)
                delete(resume.studentID)
                delete(student.studentID)
                delete(student.userID)
                response={
                    state: "success",
                    data: {
                        resume,
                        student,
                        user
                    }
                }
            } else throw "resume:resumeTypeErr"
        } else throw "resume:actionErr"
    } catch(err) {
        console.log(err)
        if(typeof(err)=="string") response = {state: err,data: {}}
    } finally {
        res.send(response);
    }
})

router.post('/', async({ cookies, body: { action ,data:{resumeID,targetSet,targetID,updateName,updateData} } }, res) => {
    let response = {
        state: "unknownError",
        data: {}
    }
    try{        
        await executeSql(`begin;`)
        if(action != "updateMyResume") throw "resume:actionErr"
        if(cookies.loginState!="student"||!cookies.student)  throw "identityErr"
        let [{userID}] = await executeSql(`SELECT userID  FROM \`resume\`,\`student\` WHERE\`resumeID\`= "${resumeID}" AND \`resume\`.\`studentID\`=\`student\`.\`studentID\`;`)
        if(userID!=cookies.student) throw "resume:noRightErr"
        await executeSql(`UPDATE \`${targetSet}\` SET \`${updateName}\` = "${updateData}" WHERE (\`${targetSet}ID\` = "${targetID}");`);
        response = {
            state: "success",
            data: {}
        }
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