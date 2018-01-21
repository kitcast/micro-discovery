const registry = require('../../registry')

module.exports = registry({
  services: [
    {
      name: 'weather',
      secret: 'weather-secret-token',
      endpoint: 'http://localhost:3000',
      acl: ['ghost']
    },
    {
      name: 'media',
      secret: 'media-secret-token',
      endpoint: 'http://localhost:3001',
      acl: ['ghost', 'weather']
    },
    {
      name: 'ghost',
      secret: 'ghost-secret-token'
    }
  ],
  config: {
    statsd_port: 8125,
    statsd_host: 'statsd.example.com',
    statsd_prefix: '88b9e226-aaea-49cf-ab8034b05552.777',
    weather_apikey: {
      value: 'ywZOe238yXc4URp',
      acl: ['weather']
    },
    db_connection_string: {
      value: 'redis://212.2.32.2:1234',
      acl: ['ghost']
    },
    stripe_apikey: {
      value: 'sk_test_dfe7v6gfJvad23rfggfdE345',
      acl: ['ghost']
    }
  }
})
