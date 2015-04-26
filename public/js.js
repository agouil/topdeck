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


mapAddToWaitQueue(function () {
  $('.map-canvas').each(function (i, mapCanvas) {
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
    google.maps.event.addListener(marker, 'click', function () {
      infowindow.open(map, marker);
    });
  });
});

function populateLocationData() {
  console.log('getlocation')
  $('.step-container').each(function (i, steps) {
    function showPosition(position) {
      $(steps).find('.step').each(function (i, step) {
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
}


function showMapForStep(mapCanvas) {
  if (mapCanvas.length > 0 && !mapCanvas.hasClass('init')) {
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


      var myloc = new google.maps.Marker({
        clickable: false,
        icon: new google.maps.MarkerImage('//maps.gstatic.com/mapfiles/mobile/mobileimgs2.png',
            new google.maps.Size(22, 22),
            new google.maps.Point(0, 18),
            new google.maps.Point(11, 11)),
        shadow: null,
        zIndex: 999,
        map: map // your google.maps.Map object
      });

      if (navigator.geolocation) navigator.geolocation.getCurrentPosition(function (pos) {
        var me = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        myloc.setPosition(me);
      });

    });
  }
}

$('.step-type-stop .step-details').on('show.bs.collapse', function () {
  showMapForStep($(this).find('.stop-map-canvas'));
});

function calcDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km (change this constant to get miles)
  var dLat = (lat2 - lat1) * Math.PI / 180;
  var dLon = (lon2 - lon1) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  if (d > 1) return Math.round(d) + "km";
  else if (d <= 1) return Math.round(d * 1000) + "m";
  return d;
}

function goToNextStep() {
  var currentStep = $('.step.current-step').removeClass('current-step');
  // hide the details
  currentStep.find('.step-details').addClass('collapse');
  console.log(currentStep.find('.step-bar'));
  var nextStep = $(currentStep.next()[0]);
  nextStep.addClass('current-step');
  // show the details of the next step
  nextStep.find('.step-details').collapse('show');
  // scroll down to the next step
  var container = $('html,body'),
      navbarHeight = 53;
  container.animate({
    scrollTop: nextStep.offset().top - container.offset().top + container.scrollTop() - navbarHeight
  });
}

// Calling
$(document).ready(function() {
  showMapForStep($('.step-details:not(.collapse) .stop-map-canvas'));

    if ($('#callRequest').length > 0) {
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
  if ($('#btn_detail_purchase').length > 0) {
    $('#btn_detail_purchase').click(function () {
      $('#btn_detail_purchase').addClass('hidden');
      $('#paymentLoadingGif').removeClass('hidden');

      var id = $(this).attr('data-id');
      var url = '/payment/tour/' + id
      $.ajax({
        url: url
      }).success(function (response) {
        $('#paymentLoadingGif').addClass('hidden');
        $('#paymentContainer').html(response);
        $('#payment_cancel_button').click(function () {
          $('#paymentContainer').empty();
          $('iframe').remove();
          $('#btn_detail_purchase').removeClass('hidden');
        });
      });
    });
  }

  $('.start-tour .btn').click(function() {
    goToNextStep();
    $(this).parent('.start-tour').hide();
    $('.next-stop').show();
    var currentStep = $('.step.current-step');
    $('.next-stop .step-distance').html(
        currentStep.find('.step-distance').html()
    );
  });

  $('.next-stop .btn').click(function() {
    goToNextStep();
    var currentStep = $('.step.current-step');
    $('.next-stop .step-distance').html(
        currentStep.find('.step-distance').html()
    );
  });

  if ($('#tour').length > 0) {
    populateLocationData();

    setInterval(populateLocationData, 5000);
  }

/*
  if ($('#callRequest')) {
    $('#callRequest').click(function () {
      $.ajax({
        url: '/tourtext/' + $('#callRequest').data('route-id'),
        cache: false,
        timeout: 5000,
        success: function (data) {
        }
      });
    });
  }
  if ('#btn_detail_purchase') {
    $('#btn_detail_purchase').click(function () {
      var id = $(this).attr('data-id');
      var url = '/payment/tour/' + id
      $.ajax({
        url: url
      }).success(function (response) {
        $('#btn_detail_purchase').addClass('hidden');
        $('#paymentContainer').html(response);
        $('#payment_cancel_button').click(function () {
          $('#paymentContainer').empty();
          $('#btn_detail_purchase').removeClass('hidden');
        });
      });
    });

  }*/
});
