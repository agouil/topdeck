var express = require('express');
var braintree = require('braintree');
var router = express.Router();
var gateway = braintree.connect({
    environment:  braintree.Environment.Sandbox,
    merchantId:   'fy59z4yjh6zq56rg',
    publicKey:    'pkztbc4b56grbs5j',
    privateKey:   '6a925c72a4aa947bf06e5289056fa05d'
  });

router.get('/tour/:id', function(req, res, next) {
  gateway.clientToken.generate({}, function (err, result) {
    if (err) throw err;
    res.render('payment', {clientToken: result.clientToken, tourId: req.params.id});
  });
});

router.post('/process', function(req, res, next) {
  var tourId = req.body.tourId;
  var nonce = req.body.payment_method_nonce;
  gateway.transaction.sale({
    amount: '10.00',
    paymentMethodNonce: nonce,
  }, function (err, authResult) {
    if (err) throw err;
    if (authResult.success && authResult.transaction.status == 'authorized') {
      gateway.transaction.submitForSettlement(authResult.transaction.id, function (err, settlementResult) {
        if (err) throw err;
        if (settlementResult.success) {
	  res.render('success', {tourId: tourId});
        } else {
          gateway.transaction.void(authResult.transaction.id, function (err, result) {});
          res.render('error', {});
        }
      });
    } else {
      res.render('error', {});
    }
  });
});

module.exports = router;
