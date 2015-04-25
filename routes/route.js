var express = require('express');
var router = express.Router();

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
        connection.query(sql, function (err, rows, fields) {
            if (err) throw err;

            var steps = [];
            for (var i = 0, len = rows.length; i < len; i++) {
                var row = rows[i];
                if (row.spotName) {
                    steps.push({
                        id: row.id,
                        name : row.spotName,
                        details: row.spotText,
                        image : row.spotImage,
                        lng : row.lng,
                        lat : row.lat
                    })
                } else {
                    var name = row.busStopName.toLowerCase().replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function($1) {
                        return $1.toUpperCase();
                    });
                    steps.push({
                        id: row.id,
                        name : 'Number ' + row.busRoute + ' Bus from ' + name,
                        details: 'Bus Stop',
                        image : '/img/bus.jpg',
                        lng : row.lng,
                        lat : row.lat
                    })
                }
            }
            res.render('route', {tourSteps: steps});
        });
    });
});

module.exports = router;
