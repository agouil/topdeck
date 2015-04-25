var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {

  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : '127.0.0.1',
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


    connection.query('SELECT * from tb_bus_stop', function(err, rows, fields) {
      if (err) throw err;

      res.send(rows[0]);
    });
  });

});

module.exports = router;

