var express = require('express');
var router = express.Router();



router.post('/', function(req, res, next) {

  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host     : '10.205.252.133',
    port     : '8889',
    user     : 'topdeck',
    password : 'topdeck',
    database : 'topdeck'
  });

  var insertObj = {
    fk_user_id : 1,
    type : req.body.type,
    fk_spot_id : req.body.spotId
  };

  connection.query('INSERT INTO tb_spot_vote SET ?', insertObj, function(err, result) {
    connection.destroy();
    if (err) {
      res.send('failed');
    } else {
      res.send('success');
    }
  });
});



module.exports = router;