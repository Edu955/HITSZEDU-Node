var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'dtz15245033841',
    database : 'GuangXiYouXue',
    multipleStatements: true,
  });

function connectMysql() {
    return new Promise ((resolve, reject)=>{
        connection.connect((err)=>{
            if(err) reject(err)
            else resolve()
        })
    })
}

function executeSql(sql){
    return new Promise ((resolve, reject)=>{
        connection.query(sql,(err, result)=>{
            if(err) reject(err)
            else resolve(result)
        })
    })
}

function closeMysql() {
    return new Promise ((resolve, reject)=>{
        connection.end((err)=>{
            if(err) reject(err)
            else resolve()
        })
    })
}

module.exports = {
    connectMysql:connectMysql,
    executeSql:executeSql,
    closeMysql:closeMysql
}