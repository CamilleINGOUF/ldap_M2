var express = require('express');
var router = express.Router();

var LDAP = require('../utils/LDAP')

/* GET home page. */
router.post('/connect', async (req, res, next) => {
    const result = await LDAP.connect(req.body.login, req.body.pass)
    console.log({result})
    res.send(result)
});

router.post('/disconnect', async (req, res, next) => {
    console.log('disco')
    const result = await LDAP.disconnect()
    console.log({result})
    res.status(200).json(result)
});

module.exports = router;
