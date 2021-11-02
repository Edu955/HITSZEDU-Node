const router = require("express").Router();
const { executeSql } = require("../utils/mysqlHelper")
const { nanoid } = require('nanoid')

router.get('/', async({ cookies, query: { action } }, res) => {
    let response = { state: "unknownError", data: {} }
    try{        
        if(action == ""){

        } else if (action = ""){

        } else throw "actionErr"
    } catch(err) {
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