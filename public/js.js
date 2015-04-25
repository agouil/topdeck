
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

        console.log(mapCanvas)

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