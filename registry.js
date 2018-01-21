const assert = require('http-assert')
const { createHash } = require('crypto')
const { sign, decode, verify, makeKeypair } = require('tilde-token')

module.exports = ({ services = [], config = {}, ttl = 60 * 5 }) => {
  const serviceArray = services.map((service) => ({
    endpoint: '',
    apiKey: createHash('sha256').update(
      makeKeypair(service.secret).publicKey
    ).digest().toString('base64').replace(/=/g, ''),
    ...service
  }))
  const configArray = Object.entries(config || {}).map(([key, value]) => ({
    key,
    value: value.value ? value.value : value,
    acl: value.acl
  }))
  return (req, res) => {
    assert(req.headers.authorization && req.headers.authorization.startsWith('Bearer '), 400, 'Authorization requred')
    const token = req.headers.authorization.slice(7)
    const { data: apiKey } = decode(token)
    const caller = serviceArray.find((service) => apiKey === service.apiKey)
    assert(caller, 403, 'Forbidden')
    const { ok } = verify(token, caller.secret)
    assert(ok, 403, 'Forbidden')
    const expires = Math.floor(new Date().getTime() / 1000) + ttl
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
    const configuration = configArray
      .filter((config) => !config.acl || config.acl.includes(caller.name))
      .reduce((acc, config) => ({ ...acc, [config.key]: config.value }), {})
    return {
      ok: true,
      data: {
        expires,
        services,
        configuration
      }
    }
  }
}
