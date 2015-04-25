var express = require('express');
var router = express.Router();

var q = require('Q');

router.get('/details/:id', function (req, res, next) {
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

        var tourId = req.params.id;
<<<<<<< Updated upstream

        function stepQuery(){
            var deferred = q.defer();
            var sql = 'select '
                + 'pk_tour_item as id, Stop_Name as busStopName, Route as busRoute, spot.name as spotName, rank, '
                + 'img as spotImage, text as spotText, coalesce(stop.lat, spot.lat) as lat, coalesce(stop.lng, spot.lng) as lng '
                + 'from tb_tour_item '
                + 'left join tb_bus_sequence as bus on fk_bus_sequence_id = pk_bus_sequence_id '
                + 'left join tb_bus_stop as stop on bus.Bus_Stop_Code = stop.Bus_Stop_Code '
                + 'left join tb_spot as spot on fk_spot_id = pk_spot_id '
                + 'where fk_tour_id = '
                + tourId
                + ' order by rank asc';
            connection.query(sql, deferred.makeNodeResolver());
            return deferred.promise;
        }

        function tourQuery(){
            var deferred = q.defer();
            connection.query('SELECT * FROM tb_spot where pk_spot_id = ' + tourId, deferred.makeNodeResolver());
            return deferred.promise;
        }

        q.all([stepQuery(),tourQuery()]).then(function(results) {
            var steps = results[0][0];
            var tour = results[1][0][0];

            var returnSteps = [];
            for (var i = 0, len = steps.length; i < len; i++) {
                var row = steps[i];
=======
        var sql = 'select '
            + 'pk_tour_item as id, Stop_Name as busStopName, Route as busRoute, name as spotName, rank, img as spotImage, text as spotText '
            + 'from tb_tour_item '
            + 'left join tb_bus_sequence on fk_bus_sequence_id = pk_bus_sequence_id '
            + 'left join tb_spot on fk_spot_id = pk_spot_id '
            + 'where fk_tour_id = '
            + tourId
            + ' order by rank asc';
        connection.query(sql, function (err, rows, fields) {
            if (err) throw err;

            var steps = [];
            var callText = '';
            for (var i = 0, len = rows.length; i < len; i++) {
                var row = rows[i];
>>>>>>> Stashed changes
                if (row.spotName) {
                    returnSteps.push({
                        id: row.id,
                        name : row.spotName,
                        details: row.spotText,
                        image : row.spotImage,
                        lng : row.lng,
                        lat : row.lat
                    })
                    // Add to call text
                    callText += row.spotText + '#pz2#';
                } else {
                    var name = row.busStopName.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
                        return $1.toUpperCase();
                    });
                    returnSteps.push({
                        id: row.id,
                        name : 'Number ' + row.busRoute + ' Bus from ' + name,
                        details: 'Bus Stop',
                        image : '/img/bus.jpg',
                        lng : row.lng,
                        lat : row.lat
                    })
                    // Add to call text
                    callText += 'Bus stop ' + name + '#pz2#';
                }
            }
<<<<<<< Updated upstream
            res.render('route', {
                tour : tour,
                tourSteps: returnSteps
            });

=======
            // Insert call text
            callText = callText.replace(/['"]+/g, '');
            var sqlInsertCallText = 'insert into tb_tour_call_text (text, fk_tour_id) '
            + 'values ("' + callText + '", ' + tourId + ')';
            connection.query(sqlInsertCallText, function (err, rows, fields) {
                if (err) throw err;
                res.render('route', {tourSteps: steps});
            });
>>>>>>> Stashed changes
        });
    });
});

module.exports = router;
