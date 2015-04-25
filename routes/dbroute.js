var express = require('express');
var router = express.Router();

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '10.205.252.133',
    port     : '8889',
    user     : 'topdeck',
    password : 'topdeck',
    database : 'topdeck'
});

var db = connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }

    console.log('connected as id ' + connection.threadId);
});

/* GET users listing. */
router.get('/', function(req, res, next) {

    db.query('SELECT * from tb_bus_stop', function(err, rows, fields) {
      if (err) {
          throw err;
      }

      res.send(rows[0]);
    })

});

module.exports = router;

