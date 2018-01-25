const assert = require('http-assert')
const { createHash } = require('crypto')
const { sign, safeDecode, verify, makeKeypair } = require('tilde-token')
const { now, isExpired } = require('./utils')

module.exports = ({ services = [], config = {}, ttl = 60 * 5 }) => {
  const serviceArray = services.map((service) => ({
    endpoint: '',
    config: {},
    identity: createHash('sha256').update(
      makeKeypair(service.secret).publicKey
    ).digest().toString('base64').replace(/=/g, ''),
    ...service
  }))
  return (req, res) => {
    assert(req.headers.authorization && req.headers.authorization.startsWith('Bearer '), 400, 'Authorization requred')
    const token = req.headers.authorization.slice(7)
    const { data } = safeDecode(token)
    assert(data && data.caller && data.expires, 403, 'Forbidden')
    assert(!isExpired(data.expires), 400, 'Expired token')
    const caller = serviceArray.find((service) => data.caller === service.identity)
    assert(caller, 403, 'Forbidden')
    const { ok } = verify(token, caller.secret)
    assert(ok, 400, 'Forbidden')
    const expires = now() + ttl
    const services = serviceArray
      .filter((service) =>
        service.endpoint &&
        caller.name !== service.name &&
        (!service.acl || service.acl.includes(caller.name))
      )
      .map((service) => ({
        name: service.name,
        endpoint: service.endpoint,
        token: sign({ expires, caller: caller.name }, service.secret)
      }))
    return {
      ok: true,
      data: {
        initiator: caller.name,
        expires,
        services,
        configuration: {
          ...config,
          ...caller.config
        }
      }
    }
  }
}
