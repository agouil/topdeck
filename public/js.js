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
	if ($(step).hasClass('step-type-stop')) {
	  var countdown = $(step).find('span.step-countdown');
	  if ($(countdown).html() == '') {
	  	  var lineId = $(countdown).data('lineid');
		  var busStopName = $(countdown).data('bus-stop-name').replace(/_/g," ");
		  $.ajax({
	            url: '/tour/tfl/countdown/' + lineId + '/' + busStopName,
       		    cache: false,
       	     	    timeout: 5000,
       	    	    success: function (data) {
		      var data = $.map(data, function(value, key) {
           	       return [value];
            	      });
		      var minsText = 'mins';
		      if (data[0] == 1) {
			      minsText = 'min';
		      }
		      $(countdown).html('departs in ' + data[0] + minsText);
                    }
          	});
	  }
	}
      });


      if (mapLocMarker) {
        var newLatLng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
        );
        mapLocMarker.setPosition(newLatLng);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    }
  });
}

var mapLocMarker = null;
function showMapForStep(mapCanvas) {
  if (mapCanvas.length > 0 && !mapCanvas.hasClass('init')) {
    mapCanvas.addClass('init');
    mapAddToWaitQueue(function () {
      var steps = $('.step'),
          busStop = steps.first();
      var myLatlng = new google.maps.LatLng(
              $(busStop).data('lat'),
              $(busStop).data('lng')
          ), mapOptions = {
            zoom: 16,
            center: myLatlng
          },
          map = new google.maps.Map(
              mapCanvas[0],
              mapOptions
          );

      steps.each(function () {
        var stepNumber = $(this).data('step'),
            contentString = $(this).find('.step-name .name').text()
                + '<br/>'
                + '<button class="btn btn-primary" data-step="' + stepNumber
                + '">See guide</button>';

        var infowindow = new google.maps.InfoWindow({
          content: contentString
        });


        var myLatlng = new google.maps.LatLng(
                $(this).data('lat'),
                $(this).data('lng')
            ),
            marker = new google.maps.Marker({
              position: myLatlng,
              map: map,
              title: contentString
            });
        google.maps.event.addListener(marker, 'click', function () {
          infowindow.open(map, marker);
        });
      });


      mapLocMarker = new google.maps.Marker({
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
        mapLocMarker.setPosition(me);
      });

    });
  }
}


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

function scrollToStep(step) {
  var nextStep = $('#step-' + step);

  var currentStep = $('.step.current-step');
  var stepDetails = currentStep.find('.step-details');

  // start moving to the next step before doing anything to keep things aligned
  var container = $('html,body'),
      navbarHeight = 63,
      prevStepHeight = stepDetails ? stepDetails.outerHeight() : 0;
  container.animate({
    scrollTop: nextStep.offset().top - container.offset().top + container.scrollTop() - navbarHeight - prevStepHeight
  });
}

function showDetailsForStep(step) {
  var currentStep = $('.step.current-step').removeClass('current-step');
  var stepDetails = currentStep.find('.step-details');
  var nextStep = $('#step-' + step);

  // hide the details
  stepDetails.collapse('hide');
  nextStep.addClass('current-step');
  // show the details of the next step
  nextStep.find('.step-details').collapse('show');
  // scroll down to the next step
}

function goToStep(step) {
  scrollToStep(step);
  showDetailsForStep(step);
}

function goToNextStep() {
  var currentStep = $('.step.current-step');
  var nextStep = currentStep.next().first().data('step');
  goToStep(nextStep);
}

function checkForPaypal() {
  if ($('#checkout').height() > 30) {
    $('#checkout').addClass('checkoutBorder');
  }
  if ($('#checkout').height() > 90) {
    window.clearTimeout(global_timer)
    $('#paymentLoadingGif').addClass('hidden');
    $('#checkout .buttons').removeClass('hidden')
  }
}

// It's a hackthon, leave me alone
var global_timer = false;

// Calling
$(document).ready(function () {
  showMapForStep($('.stop-map-canvas'));

  if ($('.dropdown-toggle').length > 0) {
    $('.dropdown-toggle').dropdown();
  }

  if ($('#callRequest').length > 0) {
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
  if ($('#btn_detail_purchase').length > 0) {
    $('#btn_detail_purchase').click(function () {
      global_timer = setInterval(function () {
        checkForPaypal()
      }, 500);

      $('#btn_detail_purchase').addClass('hidden');
      $('#paymentLoadingGif').removeClass('hidden');

      var id = $(this).attr('data-id');
      var url = '/payment/tour/' + id
      $.ajax({
        url: url
      }).success(function (response) {
        $('#paymentContainer').html(response);
        $('#payment_cancel_button').click(function () {
          $('#paymentContainer').empty();
          $('iframe').remove();
          $('#btn_detail_purchase').removeClass('hidden');
        });
      });
    });
  }


  $('#curr-location').click(function() {

    function updateInputs(position) {
      console.log('ergegergerg')
      $('#id_lat').val(position.coords.latitude);
      $('#id_lng').val(position.coords.longitude);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(updateInputs);
    }
  });

  $('.landmark-form .upload-box').click(function() {
    $("#id_img").click();
  });

  if ($('.tour').length > 0) {
    $('.step').first().find('.step-details').collapse('show');

    populateLocationData();

    setInterval(populateLocationData, 5000);

    $('.stop-map-canvas').on('click', '.btn', function (event) {
      var button = $(event.target);
      goToStep(button.data('step'));
    });


    $('.start-tour .btn').click(function () {
      goToNextStep();
      $(this).parent('.start-tour').hide();
      $('.next-stop').show();
      var currentStep = $('.step.current-step');
      $('.next-stop .step-distance').html(
          currentStep.find('.step-distance').html()
      );
    });

    $('.next-stop .btn').click(function () {
      goToNextStep();
      var currentStep = $('.step.current-step');
      if (currentStep.next().length > 0) {
        $('.next-stop .step-distance').html(
            currentStep.find('.step-distance').html()
        );
      } else {
        $(this).parent('.next-stop').hide();
        $('.tour-done').show();
      }
    });

    $('.vote').click(function (event) {
      var type = $(this).hasClass('vote-up') ? 'up' : 'down';
      var spotId = $(this).parents('.vote-form').data('spot-id');
      $.post("/vote",
          {
            spotId: spotId,
            type: type
          },
          function (data) {

          });
      $(this).siblings().hide();
      $(this).parent('.btn-group').removeClass('btn-group');
      $(this).addClass('col-xs-12').removeClass('col-xs-6')
      $(this).html('<i class="fa fa-check"></i> Thank you for Voting')
    });

    $('a.flag').click(function(e) {
      e.preventDefault();
      var lang = $(this).children('.flag-icon').attr('data-lang');
      $('.navbar-collapse').removeClass('in');


      $('.step-details-text').each(function() {
        var _self = this;
        $.ajax({
          url: 'https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20150426T023609Z.c75f708b87a721ba.694b87f3beb45ac835a7b9d0a510191c30e20f91&lang='
              + $(this).attr('data-current') + '-'
              + lang + '&text=' + $(this).html(),
          cache: false,
          timeout: 5000,
          success: function (data) {
            var data = $.map(data, function(value, key) {
              return [value];
            });
            $(_self).attr('data-current', lang)
            $(_self).html(data[2][0])
          }
        });
      });
    });
  }
});
