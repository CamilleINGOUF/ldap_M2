var express = require('express');
var router = express.Router();

var LDAP = require('../utils/LDAP')
var ldapjs = require('ldapjs')

/* GET users listing. */
router.get('/', async function(req, res, next) {
  const result = await LDAP.search('group')
  res.send(result);
});

router.post('/', async (req, res, next) => {
  const state = req.body.state
  if(state.addUser) {
    console.log(req.body.state)
    const change = new ldapjs.Change({
      operation: 'add',
      modification: {
        memberUid: state.uid
      }
    });
    const resultat = await LDAP.put(req.body.state.dn, change)
    res.send(resultat)
  } else if(state.removeUser) {
    console.log(req.body.state)
    const change = new ldapjs.Change({
      operation: 'delete',
      modification: {
        memberUid: state.uid
      }
    });
    const resultat = await LDAP.put(req.body.state.dn, change)
    res.send(resultat)
  } else if(state.import) {
    delete state.group.dn
    const resultat = await LDAP.add(state.dn, state.group)
    res.send(resultat)
  } else if(state.supp) {
    const resultat = await LDAP.del(req.body.state.dn)
    res.send(resultat)
  } else {
    const dn = 'cn='+state.name+',ou=group,dc=bla,dc=com'
    const random = Math.floor(Math.random() * 5000 + 1000)
    const user = {
      cn: state.name,
      gidNumber: random,
      description: state.description,
      objectClass: [
        'top',
        'posixGroup'
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
