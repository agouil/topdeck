var express = require('express');
var braintree = require('braintree');
var mysql = require('mysql');
var router = express.Router();
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: 'fy59z4yjh6zq56rg',
  publicKey: 'pkztbc4b56grbs5j',
  privateKey: '6a925c72a4aa947bf06e5289056fa05d'
});
var moment = require('moment');
moment().format();

var connection = mysql.createConnection({
  host: '10.205.252.133',
  port: '8889',
  user: 'topdeck',
  password: 'topdeck',
  database: 'topdeck'
});

function makePayment(gateway, nonce, tour, response) {
  gateway.transaction.sale({
        amount: tour.cost,
        paymentMethodNonce: nonce
      }, function (err, authResult) {
        if (err) throw err;
        if (authResult.success && authResult.transaction.status == 'authorized') {
          gateway.transaction.submitForSettlement(authResult.transaction.id, function (err, settlementResult) {
                if (err) throw err;
                if (settlementResult.success) {
                  // log transaction
                  connection.query('insert into tb_tour_transaction(cost, fk_tour_id, datetime) values (' + tour.cost + ',' + tour.pk_tour_id + ',now())', function (err, result) {
                    if (err) {
                      throw err;
                    }

                    // get contributors and their rankings

                    var sql = 'SELECT '
                        + 'pk_user_id as userId, '
                        + 'count(distinct pk_spot_id) as spots, '
                        + 'count(type) as votes, '
                        + 'sum(case when type is null then null when type = \'up\' then 1 else null end) as upVotes, '
                        + 'sum(case when type is null then null when type = \'down\' then 1 else null end) as downVotes '
                        + 'from tb_user as user '
                        + 'INNER JOIN tb_spot as spot on spot.fk_user_id = pk_user_id '
                        + 'INNER JOIN tb_tour_item as item on spot.pk_spot_id = item.fk_spot_id '
                        + 'LEFT JOIN tb_spot_vote as vote on vote.fk_spot_id = spot.pk_spot_id '
                        + 'where item.fk_tour_id = ' + tour.pk_tour_id + ' '
                        + 'group by pk_user_id';
                    connection.query(sql, function (err, result) {
                      console.log(err)
                      console.log(result)
                      var cut = 0.2,
                          pot = (1 - cut) * tour.cost;

                      var userWeight = [];
                      var totalVotes = 0;
                      var insertObj = [];
                      for (var i = 0; i < result.length; i++) {
                        var row = result[i];
                        totalVotes += parseInt(row.votes);
                      }
                      for (var j = 0; j < result.length; j++) {
                        var row = result[j];

                        userWeight[row.userId] = parseInt(row.votes) / parseInt(totalVotes);
                        insertObj.push({
                          fk_user_id: row.userId,
                          amount: pot * userWeight[row.userId]
                        });
                      }

                      connection.query('INSERT INTO tb_payment_user_transaction SET ? ;', insertObj, function (err, result) {
                      });

                    });

                    response.render('success', {tourId: tour.pk_tour_id});

                    var sendgrid = require("sendgrid")('hsearle', 'battlehack15');

                    var now = moment();


                    connection.query('SELECT * FROM tb_tour where pk_tour_id = ' + tour.pk_tour_id, function(err, result) {
                      var tour = result[0];

                      var name = 'Joe';
                      var fullName = 'Joe Ruggieri';
                      var emailTo = 'joe.ruggieri@gmail.com';

                      sendgrid.send({
                        to: emailTo,
                        toName: fullName,
                        bcc: 'henry.searle@gmail.com',
                        from: 'tours@topdeck.co.uk',
                        fromName: 'TopDeck Tours',
                        subject: 'Your Tour on ' + now.format('YYYY MMM DD'),
                        html: 'Hi ' + name + ', <br/><br/>Thank you for purchasing our ' + tour.name + ' tour today. We hope you thoroughly enjoyed it and can continue enjoying the different tours we have to offer.<br/><br/>Your Sincerly,<br/>TopDeck Team.'
                      }, function (err, json) {
                        if (err) {
                          return console.error(err);
                        }
                        console.log(json);
                      });
                    });

                  });
                }
                else {
                  gateway.transaction.void(authResult.transaction.id, function (err, result) {
                  });
                  response.render('error', {});
                }
              }
          )
          ;
        }
        else {
          response.render('error', {});
        }
      }
  )
  ;
}

router.get('/success', function (req, res, next) {
  res.render('success', {tourId: 1})
})
router.get('/tour/:id', function (req, res, next) {
  gateway.clientToken.generate({}, function (err, result) {
    if (err) throw err;
    res.render('payment', {clientToken: result.clientToken, tourId: req.params.id});
  });
});

router.post('/process', function (req, res, next) {
  var tourId = req.body.tourId;
  var nonce = req.body.payment_method_nonce;
  connection.connect(function (err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
    console.log('connected as id ' + connection.threadId);
  });
  connection.query('select * from tb_tour where pk_tour_id = ' + tourId, function (err, rows, fields) {
    var tour = rows[0];
    makePayment(gateway, nonce, tour, res);
  });
});

module.exports = router;
