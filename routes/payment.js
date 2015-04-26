var express = require('express');
var braintree = require('braintree');
var mysql = require('mysql');
var router = express.Router();
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'fy59z4yjh6zq56rg',
    publicKey:    'pkztbc4b56grbs5j',
    privateKey:   '6a925c72a4aa947bf06e5289056fa05d'
});

var connection =  mysql.createConnection({
  host     : '10.205.252.133',
  port     : '8889',
  user     : 'topdeck',
  password : 'topdeck',
  database : 'topdeck'
});

function makePayment(gateway, nonce, tour, response)  {
  gateway.transaction.sale({
    amount: tour.cost,
    paymentMethodNonce: nonce,
  }, function (err, authResult) {
    if (err) throw err;
    if (authResult.success && authResult.transaction.status == 'authorized') {
      gateway.transaction.submitForSettlement(authResult.transaction.id, function (err, settlementResult) {
        if (err) throw err;
        if (settlementResult.success) {
          connection.query('insert into tb_tour_transaction(cost, fk_tour_id, datetime) values (' + tour.cost + ',' + tour.pk_tour_id + ',now())', function(err, result) {
            if (err) throw err;
	    response.render('success', {tourId: tour.pk_tour_id});
	  });
        } else {
          gateway.transaction.void(authResult.transaction.id, function (err, result) {});
          response.render('error', {});
        }
      });
    } else {
      response.render('error', {});
    }
  });
}

router.get('/success', function(req, res, next) {
  res.render('success', {tourId : 1})
})
router.get('/tour/:id', function(req, res, next) {
  gateway.clientToken.generate({}, function (err, result) {
    if (err) throw err;
    res.render('payment', {clientToken: result.clientToken, tourId: req.params.id});
  });
});

router.post('/process', function(req, res, next) {
  var tourId = req.body.tourId;
  var nonce = req.body.payment_method_nonce;
  connection.connect(function(err) {
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
