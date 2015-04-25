
var mapsReturned = false,
    mapsQueue = [];

function mapAddToWaitQueue(callback) {
    if (mapsReturned) {
        callback();
    } else {
        mapsQueue.push(callback);
    }
}

function initialize() {
    mapsReturned = true;
    for (var i = 0; i < mapsQueue.length; i++) {
        var callback = mapsQueue[i];
        callback();
    }
}
google.maps.event.addDomListener(window, 'load', initialize);


mapAddToWaitQueue(function() {
    $('.map-canvas').each(function(i, mapCanvas) {
        var myLatlng = new google.maps.LatLng(
                $(mapCanvas).data('lat'),
                $(mapCanvas).data('lng')
            ),
            mapOptions = {
                zoom: 13,
                center: myLatlng
            },
            map = new google.maps.Map(
                mapCanvas,
                mapOptions
            );

        var contentString = $(mapCanvas).data('name');

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: contentString
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map, marker);
        });
    });
});


$('.step-container').each(function(i, steps) {
    function showPosition(position) {
        $(steps).find('.step').each(function(i, step) {
            var lat = $(step).data('lat'),
                lng = $(step).data('lng'),
                distance = calcDistance(
                        lat,
                        lng,
                        position.coords.latitude,
                        position.coords.longitude
                    );

            $(step).find('.step-distance').html(distance);

        });
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
});

$('.step-type-stop .step-details').on('show.bs.collapse', function () {
    var mapCanvas = $(this).find('.stop-map-canvas');
    if (!mapCanvas.hasClass('init')) {
        mapCanvas.addClass('init');
        mapAddToWaitQueue(function () {
            var myLatlng = new google.maps.LatLng(
                    $(mapCanvas).data('lat'),
                    $(mapCanvas).data('lng')
                ),
                mapOptions = {
                    zoom: 16,
                    center: myLatlng
                },
                map = new google.maps.Map(
                    mapCanvas[0],
                    mapOptions
                );

            var contentString = $(mapCanvas).data('name');

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: contentString
            });
            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map, marker);
            });
        });
    }
});

function calcDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    if (d>1) return Math.round(d)+"km";
    else if (d<=1) return Math.round(d*1000)+"m";
    return d;
}

// Calling
$(document).ready(function() {
    if ($('#callRequest')) {
        $('#callRequest').click(function() {
            $.ajax({
                url: '/tourtext/' + $('#callRequest').data('route-id'),
                cache: false,
                timeout: 5000,
                success: function(data) {
                }
            });
        });
    }
});
