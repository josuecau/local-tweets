var express = require('express')
var http    = require('http')
var path    = require('path')
var io      = require('socket.io')
var Twit    = require('twit')
var utils   = require('./utils')
var config  = require('./config')

var app = express()
var httpServer = http.createServer(app)

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')
app.use(express.logger('dev'))
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(express.static(path.join(__dirname, 'public')))

if ('development' === app.get('env')) {
  app.use(express.errorHandler())
}

app.get('/', function (req, res) {
  res.render('index')
})

httpServer.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})

var ioServer = io.listen(httpServer)

var T = new Twit(config.twitter)

ioServer.sockets.on('connection', function (socket) {

  socket.on('position', function (position) {

    var location = utils.boundingBox(position)

    var stream = T.stream('statuses/filter', {
      locations: location
    })

    stream.on('tweet', function (tweet) {
      if (tweet.coordinates) {
        socket.emit('tweet', utils.cleanupTweet(tweet))
      }
    })

    socket.on('disconnect', function () {
      stream.stop()
    })

  })

})

