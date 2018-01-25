const MaxTimeShift = 5
const now = () => Math.floor(new Date().getTime() / 1000)
const isExpired = (ts) => !ts || Math.min(0, parseInt(ts) - MaxTimeShift) > now()

module.exports = {
  now,
  isExpired
}
