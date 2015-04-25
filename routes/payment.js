var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('payment', {});
});

router.post('/process', function(req, res, next) {
  console.log('init payment');
  return; 
});

module.exports = router;
