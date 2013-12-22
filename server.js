
var express       = require('express')
    , http        = require('http')
    , path        = require('path')
    , io          = require('socket.io')
    , Twit        = require('twit')
    , twitterText = require('twitter-text')
    , _           = require('underscore')
    , GeoPoint    = require('geopoint')
    , config      = require('./config')

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

if ('development' == app.get('env')) {
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

var cleanupTweet = function (tweet) {
    var t = _.pick(tweet, 'created_at', 'id_str')
    t.text = twitterText.autoLink(tweet.text)
    t.coordinates  = _.pick(tweet.coordinates, 'coordinates')
    t.user = _.pick(tweet.user, 'name', 'screen_name', 'profile_image_url')
    return t
}

ioServer.sockets.on('connection', function (socket) {

    socket.on('position', function (position) {

        var point = new GeoPoint(position.latitude, position.longitude)
        var bbox = point.boundingCoordinates(config.geolocation.distance, null, true)
        var location = [
            bbox[0].longitude(),
            bbox[0].latitude(),
            bbox[1].longitude(),
            bbox[1].latitude()
        ]

        var stream = T.stream('statuses/filter', {
            locations: location
        })

        stream.on('tweet', function (tweet) {
            if (tweet.coordinates) {
                socket.emit('tweet', cleanupTweet(tweet))
            }
        })

    })
})

