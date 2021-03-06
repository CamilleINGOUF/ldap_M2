var express = require('express');
var router = express.Router();

var LDAP = require('../utils/LDAP')

/* GET home page. */
router.post('/connect', async (req, res, next) => {
    const result = await LDAP.connect(req.body.login, req.body.pass).catch(e => res.send(false))
    res.send(result)
});

router.post('/disconnect', async (req, res, next) => {
    const result = await LDAP.disconnect()
    res.status(200).json(result)
});

module.exports = router;
