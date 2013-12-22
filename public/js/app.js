google.maps.event.addDomListener(window, 'load', function () {

    var socket = io.connect('http://localhost');
    var map;
    var max = 10;
    var zoom = 14;
    var zIndex = 0;
    var markers = [];
    var infowindows = [];
    var tweetTemplate = _.template(' \
        <div class="tweet" id="tweet-<%= tweet.id_str %>"> \
            <a href="http://twitter.com/<%= tweet.user.screen_name %>" class="avatar"> \
                <img src="<%= tweet.user.profile_image_url %>" alt="<%= tweet.user.screen_name %>"/> \
            </a> \
            <a href="http://twitter.com/<%= tweet.user.screen_name %>" class="user"><strong><%= tweet.user.name %></strong> @<%= tweet.user.screen_name %></a> \
            <p class="text"><%= tweet.text %></p> \
        </div> \
    ');

    if (geo_position_js.init()) {
        geo_position_js.getCurrentPosition(function (position) {

            var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            map = new google.maps.Map(document.getElementById('map'), {
                zoom: zoom,
                center: latlng
            });

            var marker = new google.maps.Marker({
                position: latlng,
                map: map
            });

            var infowindow = new google.maps.InfoWindow({
                map: map,
                content: 'I am here',
                zIndex: zIndex
            });

            infowindow.open(map, marker);

            socket.emit('position', _.pick(position.coords, 'latitude', 'longitude'));

        }, function (position) {
            alert('Geolocation error');          
        });
    } else {
        alert('Geolocation not available');
    }

    socket.on('tweet', function (tweet) {

        var coords = tweet.coordinates.coordinates;
        var latlng = new google.maps.LatLng(coords[1], coords[0]);

        zIndex++;

        var marker = new google.maps.Marker({
            position: latlng,
            map: map
        });

        var infowindow = new google.maps.InfoWindow({
            content: tweetTemplate({ tweet: tweet }),
            maxWidth: 300,
            zIndex: zIndex
        });

        markers.push(marker);
        infowindows.push(infowindow);
        infowindow.open(map, marker);

        if (markers.length > max) {
            _.first(markers).setMap(null);
            _.first(infowindows).setMap(null);
            markers.shift();
            infowindows.shift();
        }

    });

});
