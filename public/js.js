
function initialize() {
    $('.map-canvas').each(function(i, mapCanvas) {

        var myLatlng = new google.maps.LatLng(
            $(mapCanvas).data('lat'),
            $(mapCanvas).data('lng')
        )

        var mapOptions = {
            zoom: 13,
            center: myLatlng
        };

        var map = new google.maps.Map(
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
}
google.maps.event.addDomListener(window, 'load', initialize);

var x = document.getElementById("demo");
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    console.log(position)
    x.innerHTML = "Latitude: " + position.coords.latitude +
        "<br>Longitude: " + position.coords.longitude;
}

getLocation();