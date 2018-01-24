const discovery = require('../..')

const { authorize, config, locate } = discovery('http://localhost:4000', 'weather-secret-token')

module.exports = async (req, res) => {
  authorize(req)

  const configuration = await config()
  console.log('Config', configuration)

  const serviceInfo = await locate('media')
  console.log('media-service info', serviceInfo)

  return { weather: '☀️' }
}
