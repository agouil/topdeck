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
    var sql = 'select * ' +
              'from tb_spot s '  +
              'join tb_tour_item ti ' +
              'on s.pk_spot_id = ti.fk_spot_id ' +
              'where ti.fk_tour_id = ' + tourId + ' ' +
              'and ti.fk_bus_sequence_id = 0';
    connection.query(sql, function(err, rows, fields) {
      if (err) throw err;
	  res.render('detail', {
	  		spots: rows
		});


    });
  });


});

module.exports = router;
