var express = require('express');
var router = express.Router();
var braintree = require('braintree');
var q = require('Q');

/* GET home page. */
router.get('/tour/:id', function(req, res, next) {
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

    var tours = false;
    var tourId = req.params.id;

    try {
    function getSpotsQuery(){
      try {
      var deferred = q.defer();
      var sql = 'select *' +
            'from tb_spot s '  +
            'join tb_tour_item ti ' +
            'on s.pk_spot_id = ti.fk_spot_id ' +
            'where ti.fk_tour_id = ' + tourId + ' ' +
            'and ti.fk_bus_sequence_id = 0';
      connection.query(sql, deferred.makeNodeResolver());
      return deferred.promise;
      } catch (err) {console.log(err)}
    }

    function getTourQuery(){
        var deferred = q.defer();
      try {
        var sql =
            'SELECT t.*, fk_line_id as busLineId, bs.name as stopName '
            + 'from tb_tour t '
            + 'left join tb_bus_stop bs on t.fk_bus_stop_start_id = bs.bus_stop_code '
            + 'where pk_tour_id = ' + tourId;
        connection.query(sql, deferred.makeNodeResolver());
        return deferred.promise;
      } catch (err) {console.log(err)}
    }


        q.all([getSpotsQuery(),getTourQuery()]).then(function(results) {
          try {
          var tour = results[1][0][0];
          var spots = results[0][0];

            res.render('detail', {
               spots: spots,
                tour: tour
            });
          } catch (err) {console.log(err)}
          });
    } catch (err) {console.log(err)}

  });


});

module.exports = router;
