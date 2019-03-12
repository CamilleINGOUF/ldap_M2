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
    let resultat = null
    if(req.body.state.admin) {
      const change = new ldapjs.Change({
        operation: 'replace',
        modification: {
          description: req.body.state.comment
        }
      });
      const change2 = new ldapjs.Change({
        operation: 'replace',
        modification: {
          sn: req.body.state.name
        }
      });
      await LDAP.put(req.body.state.dn, change)
      resultat = await LDAP.put(req.body.state.dn, change2)
    } else {
      const change = new ldapjs.Change({
        operation: 'replace',
        modification: {
          userPassword: req.body.state.pass
        }
      });
      resultat = await LDAP.put(req.body.state.dn, change)
    }
    res.send(resultat)
  } else if(state.supp) {
    const groups = await LDAP.search('people') 
    const resultat = await LDAP.del(req.body.state.dn)
    const change = new ldapjs.Change({
      operation: 'delete',
      modification: {
        memberUid: state.uid
      }
    });
    groups.forEach(async group => await LDAP.put(group.dn, change)).then(() => 
    res.send(resultat))
  } else if(state.import) {
    delete state.user.dn
    delete state.user.controls
    console.log(state.dn, state.user)
    const resultat = await LDAP.add(state.dn, state.user)
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
  let change = new ldapjs.Change({
    operation: 'replace',
    modification: {
      description: req.body.state.comment
    }
  });
  let resultat = await LDAP.put(req.body.state.dn, change)
  const change2 = new ldapjs.Change({
    operation: 'replace',
    modification: {
      userPassword: req.body.state.pass
    }
  });
  const resultat2 = await LDAP.put(req.body.state.dn, change2)
  res.send(resultat, resultat2)
});

router.delete('/', async (req, res, next) => {
  const resultat = await LDAP.del(req.body.dn)
  res.send(resultat)
});

module.exports = router;
