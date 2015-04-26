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
  });
  var tours = false;
  connection.query(
      'SELECT t.*, fk_line_id as busLineId, bs.name as stopName from tb_tour t '
      + 'left join tb_bus_stop bs on t.fk_bus_stop_start_id = bs.bus_stop_code'
      , function(err, rows, fields) {
    if (err) throw err;
    connection.destroy();
    res.render('index', {tours: rows});
  });
});

module.exports = router;
