var express = require('express')
var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Blogs list')
})
// define the about route
router.get('/:id', function (req, res) {
  res.send('retrive blog with id ' + req.params.id)
})

router.post('/', function (req, res) {
  res.send('create a blog')
})

router.put('/:id', function (req, res) {
  res.send('update blog with id ' + req.params.id)
})

router.delete('/:id', function (req, res) {
  res.send('delete blog with id ' + req.params.id)
})

router.all('', function (req, res) {
  res.send(`No endpoint was found with ${req.method} method on URL blogs${req.url }`)
})

module.exports = router