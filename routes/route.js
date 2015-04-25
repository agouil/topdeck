var express = require('express');
var router = express.Router();

router.get('/details/:id', function(req, res, next) {
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

    var tourId = req.params.id;
    var sql = 'select '
      + 'Stop_Name as busStopName, Route as busRoute, name as spotName, rank '
      + 'from tb_tour_item '
      + 'left join tb_bus_sequence on fk_bus_sequence_id = pk_bus_sequence_id '
      + 'left join tb_spot on fk_spot_id = pk_spot_id '
      + 'where fk_tour_id = '  
      + tourId 
      + ' order by rank asc';
    connection.query(sql, function(err, rows, fields) {
      if (err) throw err;

      res.render('route', { tourSteps: rows });
    });
  });
});

module.exports = router;
