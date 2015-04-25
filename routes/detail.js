var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var mysql      = require('mysql');

  var connection = mysql.createConnection({
    host     : '10.205.252.133',
    port     : '8889',
    user     : 'topdeck',
    password : 'topdeck',
    database : 'topdeck'
  });

  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    console.log('connected as id ' + connection.threadId);

    var tours = false;
    var tourId = req.query.tourId;
    console.log(tourId)
    var sql = 'SELECT * from tb_tour where pk_tour_id = ' + tourId;
    connection.query(sql, function(err, rows, fields) {
      if (err) throw err;
	  res.render('detail', {
	  		tours: rows
		});
    });
  });


});

module.exports = router;
