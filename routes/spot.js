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
    host     : '127.0.0.1',
    port     : '8889',
    user     : 'topdeck',
    password : 'topdeck',
    database : 'topdeck'
});

var db = connection.connect(function(err) {
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
            console.log('success');
            console.log(form);
            connection.query('INSERT INTO tb_spot SET ?', form.data, function(err, result) {
                // redirect to the spot info
            });
        },
        error: function (form) {
            // the data in the request didn't validate,
            // calling form.toHTML() again will render the error messages
            console.log('error');
        },
        empty: function (form) {
            // there was no form data in the request
            console.log('empty');
        }
    });
});

// View Spot
router.get('/view', function(req, res, next) {

    console.log(req)

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

    res.render('landmark', {
        landmarkAddForm: landmarkAddForm,
        bootstrapForm: bootstrapForm
    });
});

module.exports = router;
