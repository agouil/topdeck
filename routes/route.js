var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('route', { title: 'Ejs' });
});

module.exports = router;
