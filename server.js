const express = require("express");
const app = express();
const {connectMysql,closeMysql} = require("./utils/mysqlHelper")
const history = require("connect-history-api-fallback")
// const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use("/",require("./routes/home"))
app.use("/register",require("./routes/register"))
app.use("/login",require("./routes/login"))
app.use("/resume",require("./routes/resume"))
app.use("/need",require("./routes/need"))
app.use("/signup",require("./routes/signup"))


app.use(history())
app.use(express.static(__dirname+"/static"))
app.listen(5005, err =>{
    if(err){
        console.err(err)
        console.log("服务器启动失败!")
    } else {
        console.log("服务器启动成功!")
        connectMysql().then(()=>{
            console.log("数据库连接成功!")
        }).catch(function (err) {
            console.log("数据库连接失败!")
            console.log(err);
        });
    }
})