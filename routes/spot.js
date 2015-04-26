var express = require('express');
var router = express.Router();

var forms = require('forms');
var fields = forms.fields;
var validators = forms.validators;
var widgets = forms.widgets;


/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

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

    console.log('connected as id ' + connection.threadId);
});


var landmarkAddForm = forms.create({
    name: fields.string({required: true}),
    text: fields.string({required: true}),
    img: fields.string({required: true}),
    lat: fields.number({required: true}),
    lng: fields.number({required: true})
});

router.post('/add', function(req, res, next) {
    landmarkAddForm.handle(req, {
        success: function (form) {
            // there is a request and the form is valid
            // form.data contains the submitted data
            connection.query('INSERT INTO tb_spot SET ? ;SELECT LAST_INSERT_ID() as id;', form.data, function(err, result) {
                res.redirect('/spot/view/' + result.id)
            });
        }
    });
});

// View Spot
router.get('/view/:id', function(req, res, next) {

    var spotId = req.params.id;
    connection.query('SELECT * FROM tb_spot where pk_spot_id = ?', spotId, function (err, result) {
        res.render('spot/view', {
            spot: result[0]
        });
    });
});

/* Add spot. */
router.get('/add', function(req, res, next) {

    var bootstrapForm = function (name, object) {
        object.widget.classes = object.widget.classes || [];
        object.widget.classes.push('form-control');

        var label = object.labelHTML(name);
        var error = object.error ? '<div class="alert alert-error help-block">' + object.error + '</div>' : '';

        var validationclass = object.value && !object.error ? 'has-success' : '';
        validationclass = object.error ? 'has-error' : validationclass;

        var widget = object.widget.toHTML(name, object);
        return '<div class="form-group ' + validationclass + '">' + label + widget + error + '</div>';
    };

    res.render('spot/add', {
        landmarkAddForm: landmarkAddForm,
        bootstrapForm: bootstrapForm
    });
});

module.exports = router;
