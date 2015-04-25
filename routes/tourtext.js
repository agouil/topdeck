var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/:textId', function(req, res, next) {
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : '10.205.252.133',
    port     : '8889',
    user     : 'topdeck',
    password : 'topdeck',
    database : 'topdeck'
  });

  	var textParams = req.params;
  	connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
   }

    console.log('connected as id ' + connection.threadId);

    connection.query('SELECT * from tb_tour_call_text where fk_tour_id = ' 
    	+ textParams.textId
    	+ ' order by pk_tour_call_text_id desc ', function(err, rows, fields) {
      if (err) throw err;


		//require the Twilio module and create a REST client
		var client = require('twilio')('AC1ca9f4c30c702b2af7be78ebc95a25fc', '405c95f95348b95df1cf776cf1408f52');

		//Place a phone call, and respond with TwiML instructions from the given URL
		client.makeCall({
		    to:'+447711666704', // Any number Twilio can call
		    from: '+441425600048', // A number you bought from Twilio and can use for outbound communication
		    url: 'http://joeruggieri.com/twilio?desc=' + encodeURIComponent(rows[0]['text']) // A URL that produces an XML document (TwiML) which contains instructions for the call

		}, function(err, responseData) {

		    //executed when the call has been initiated.
		    console.log(err); // outputs "+14506667788"

		});

		 res.header('Content-Type','text/xml');
		 res.render('tourtext');
    });
  });

});
module.exports = router;

