var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  var mysql = require('mysql');
  var connection = mysql.createConnection({
    host: '10.205.252.133',
    port: '8889',
    user: 'topdeck',
    password: 'topdeck',
    database: 'topdeck'
  });

  connection.connect(function (err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });
  var tours = false;
  var sql = 'SELECT '
          +   'username, '
          +   'profile_image as profileImage, '
          +   'count(distinct pk_spot_id) as spots, '
          +   '(select sum(case when type = \'up\' then 1 else -1 end) from tb_spot_vote as vote where vote.fk_spot_id = spot.pk_spot_id) as votes, '
          +   '(select sum(amount) from tb_payment_user_transaction as trxn where trxn.fk_user_id = pk_user_id) as owed '
          + 'from tb_user as user '
          + 'LEFT JOIN tb_spot as spot on spot.fk_user_id = pk_user_id '
          + 'LEFT JOIN tb_spot_vote as vote on vote.fk_spot_id = spot.pk_spot_id '
          + 'group by username, profile_image';
  connection.query(
      sql,
      function (err, rows, fields) {
        if (err) throw err;
        connection.destroy();
        console.log(rows)
        res.render('users', {users: rows});
      });
});

module.exports = router;