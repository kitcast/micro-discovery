const assert = require('http-assert')
const fetch = require('node-fetch')
const { createHash } = require('crypto')
const { verifier, sign, makeKeypair } = require('tilde-token')
const { now, isExpired } = require('./utils')

module.exports = (url, secret, ttl = 60) => {
  const { publicKey } = makeKeypair(secret)
  const identity = createHash('sha256').update(publicKey).digest().toString('base64').replace(/=/g, '')
  const verifyToken = verifier(publicKey)

  let setup = {
    expires: 0,
    services: [],
    configuration: {}
  }

  function load () {
    if (!isExpired(setup.expires)) {
      return Promise.resolve(setup)
    }
    const token = sign({ caller: identity, expires: now() + ttl }, secret)
    return fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => res.json())
      .then(({ data }) => {
        setup = data || {}
        return setup
      })
  }

  return {
    authorize: (req) => {
      const { authorization } = req.headers
      assert(authorization && authorization.startsWith('Bearer '), 400, 'Authorization requred')
      const token = authorization.slice(7)
      const { ok, data } = verifyToken(token)
      assert(ok && data, 403, 'Bad token')
      assert(!isExpired(data.expires), 403, 'Expired token')
      return data
    },
    config: () => load().then(({ configuration }) => configuration),
    locate: (id) => load().then(({ services }) => services.find((service) => service.name === id))
  }
}
