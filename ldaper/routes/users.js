var express = require('express');
var router = express.Router();

var LDAP = require('../utils/LDAP')
var ldapjs = require('ldapjs')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const result = await LDAP.search('people') 
  res.send(result);
});

router.post('/', async (req, res, next) => {
  const state = req.body.state
  if(state.edit) {
    console.log(req.body.state)
    const change = new ldapjs.Change({
      operation: 'replace',
      modification: {
        description: req.body.state.comment
      }
    });
    const resultat = await LDAP.put(req.body.state.dn, change)
    res.send(resultat)
  } else if(state.supp) {
    const resultat = await LDAP.del(req.body.state.dn)
    res.send(resultat)
  } else {
    const dn = 'cn='+state.login+',ou=people,dc=bla,dc=com'
    const random = Math.floor(Math.random() * 5000 + 1000)
    const user = {
      cn: state.login,
      sn: state.name,
      uid: state.login,
      userPassword: state.login,
      homeDirectory: '/home/'+state.login,
      uidNumber: random,
      gidNumber: random,
      loginShell: '/bin/bash',  
      givenName: state.name+ ' ' + state.login,
      description: state.description,
      objectClass: [
        'top',
        'person',
        'organizationalPerson',
        'inetOrgPerson',
        'posixAccount',
        'shadowAccount'
      ]
    }
    const result = await LDAP.add(dn, user)
    res.send(result)
  }
});

router.put('/', async function(req, res, next) {
  console.log(req)
  const change = new ldapjs.Change({
    operation: 'replace',
    modification: {
      description: req.body.state.comment
    }
  });
  const resultat = await LDAP.put(req.body.state.dn, change)
  res.send(resultat)
});

router.delete('/', async (req, res, next) => {
  const resultat = await LDAP.del(req.body.dn)
  res.send(resultat)
});

module.exports = router;
