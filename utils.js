var twitterText = require('twitter-text')
var GeoPoint    = require('geopoint')
var _           = require('underscore')
var config      = require('./config')

module.exports = {

    cleanupTweet: function (tweet) {
        var t = _.pick(tweet, 'created_at', 'id_str')
        t.text = twitterText.autoLink(tweet.text)
        t.coordinates  = _.pick(tweet.coordinates, 'coordinates')
        t.user = _.pick(tweet.user, 'name', 'screen_name', 'profile_image_url')
        return t
    },

    boundingBox: function (position) {
        var point = new GeoPoint(position.latitude, position.longitude)
        var bbox = point.boundingCoordinates(config.geolocation.distance, null, true)
        return [
            bbox[0].longitude(),
            bbox[0].latitude(),
            bbox[1].longitude(),
            bbox[1].latitude()
        ]
    }
}
