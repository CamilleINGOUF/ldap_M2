var ldaper = require('ldapjs')
const assert = require('assert')

let client = null
var loginConnected = ''
// +',dc=bla,dc=com'
async function connect(login, pass) {
  loginConnected = login
  return await connectClient(login, pass).then(res => res)
}

async function connectClient(login, pass, callback) {
  if (login !== 'Admin')
    login += ',ou=people'
  return new Promise((resolve, reject) => {
    client = ldaper.createClient({
      url: 'ldap://ldap:389'
    })
    client.bind('cn=' + login + ',dc=bla,dc=com', pass, (err) => {
      if (err) {
        client.unbind();
        reject(false)
      } else {
        resolve(true)
      }
    })
  })
}

async function disconnect() {
  return new Promise((resolve, reject) => {
    client.unbind()
    resolve({
      result: true
    })
  })
}

async function search(ou) {
  return new Promise((resvole, reject) => {
    var opts = {
      filter: loginConnected === 'Admin' ? '(objectclass=*)' : '(&(uid=' + loginConnected + '))',
      scope: 'sub'
    };
    client.search('ou=' + ou + ',dc=bla,dc=com', opts, function (err, res) {
      assert.ifError(err)
      let entries = []
      res.on('searchEntry', function (entry) {
        entries.push(entry.object)
      });

      res.on('searchReference', function (referral) {
        console.log('referral: ' + referral.uris.join());
      });

      res.on('error', function (err) {
        console.error('error: ' + err.message);
        reject(err)
      });

      res.on('end', function (result) {
        entries.push({
          login: loginConnected,
          'admin': (loginConnected === 'Admin')
        })
        resvole(entries)
      });
    })
  })
}

async function add(dn, user) {
  return new Promise((resolve, reject) => {
    client.add(dn, user, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

async function del(dn) {
  return new Promise((resolve, reject) => {
    client.del(dn, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

async function put(dn, change) {
  return new Promise((resolve, reject) => {
    client.modify(dn, change, function (err, res) {
      if (err) reject(err)
      else resolve(res)
    })
  })
}

module.exports.connect = connect
module.exports.search = search
module.exports.add = add
module.exports.del = del
module.exports.put = put
module.exports.disconnect = disconnect