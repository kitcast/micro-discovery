const assert = require('http-assert')
const fetch = require('node-fetch')
const { createHash } = require('crypto')
const { verifier, sign, makeKeypair } = require('tilde-token')

const now = () => Math.floor(new Date().getTime() / 1000)

module.exports = (url, secret) => {
  const { publicKey } = makeKeypair(secret)
  const acessToken = sign(
    createHash('sha256').update(publicKey).digest().toString('base64').replace(/=/g, ''),
    secret
  )
  const verifyToken = verifier(publicKey)

  let setup = {
    expires: 0,
    services: [],
    configuration: {}
  }

  function load () {
    if ((setup.expires - 5) > now()) {
      return Promise.resolve(setup)
    }
    return fetch(url, { headers: { 'Authorization': `Bearer ${acessToken}` } })
      .then((res) => res.json())
      .then(({ data = {} }) => {
        setup = data
        return setup
      })
  }

  return {
    authorize: (req) => {
      const { authorization } = req.headers
      assert(authorization && authorization.startsWith('Bearer '), 400, 'Authorization requred')
      const token = authorization.slice(7)
      const { ok, data } = verifyToken(token)
      assert(ok && data, 403, 'Bad, bad token')
      data.expires && assert(parseInt(data.expires) > now(), 403, 'Expired token')
      return data
    },
    config: () => load().then(({ configuration }) => configuration),
    locate: (id) => load().then(({ services }) => services.find((service) => service.name === id))
  }
}
