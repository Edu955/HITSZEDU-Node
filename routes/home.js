const router = require("express").Router();
router.get('/', (req, res)  => {
    console.log(req.query)
    console.log('Hello World get')
    res.send('Hello World');
})

router.post('/', (req, res) => {
    console.log(req.body);
    console.log('Hello World post')
    res.send('Hello World');
})

module.exports=router;


