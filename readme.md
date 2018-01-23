# 🛰 Lightweight service discovery

[![NPM Version](https://img.shields.io/npm/v/micro-discovery.svg?style=flat-square)](https://www.npmjs.com/package/micro-discovery)
[![node](https://img.shields.io/node/v/micro-discovery.svg?style=flat-square)](https://www.npmjs.com/package/micro-discovery)
[![Build Status](https://img.shields.io/travis/kitcast/micro-discovery.svg?branch=master&style=flat-square)](https://travis-ci.org/kitcast/micro-discovery)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

*🚧 Work in progress*

Place where old-school `Service Registry` meets crypto.

## Installation

Install from NPM:

```js
$ npm install micro-discovery --save
```

For `yarn` fans:

```js
$ yarn add micro-discovery
```


## Examples

Following examples designed as simple [`Micro`](https://github.com/zeit/micro) handlers. If you don't familar with `Micro` - you definetelly must try theese goodness.

Basic service registry includes node config, secret keys, and access control list.

```js

const registry = require('micro-discovery/registry')

module.exports = registry({
  // Services list
  services: [
    {
      name: 'weather',
      secret: 'weather-secret-token',
      endpoint: 'https://weather.now.sh',
      acl: ['ghost'],
      config: {
        weather_apikey: 'ywZOe238yXc4URp'
      }
    },
    {
      name: 'media',
      secret: 'media-secret-token',
      endpoint: 'https://media.now.sh',
      acl: ['ghost', 'weather']
    },
    {
      name: 'ghost',
      secret: 'ghost-secret-token',
      config: {
        db_connection_string: 'redis://212.2.32.2:1234',
        stripe_apikey: 'sk_test_dfe7v6gfJvad23rfggfdE345'
      }
    }
  ],
  // Shared config
  config: {
    statsd_port: 8125,
    statsd_host: 'statsd.example.com',
    statsd_prefix: '88b9e226-aaea-49cf-ab8034b05552.777'
  }
})
```

Basic microservice

```js
const discovery = require('../..')

const { authorize, config, locate } = discovery('https://your-registry.now.sh', 'weather-secret-token')

module.exports = async (req, res) => {
  // Authorize service call. 
  // Fully synchronous, you even don't need to interact with a registry.
  authorize(req)

  // Retrieve service configuration
  const configuration = await config()
  console.log('Config', configuration)

  // Service info will contains service endpoint, and temporary token.
  const serviceInfo = await locate('media')
  console.log('media-service info', serviceInfo)
  // fetch(serviceInfo.endpoint, {
  //  headers: { Authorization: `Bearer ${serviceInfo.token}`}
  // })

  return { weather: '☀️' }
}
```
