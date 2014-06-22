var _ = require('lodash-node');
var debug = require('debug')('dewwwifier');
var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var path = require('path');
var async = require('async');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hjs').__express);

if ('production' === app.get('env')) {
    app.set('libs', '//cdnjs.cloudflare.com/ajax/libs'); // Get minified libs from cloud
    app.set('min', '.min');
    // TODO: get values from Heroku.
}
else {
    app.set('libs', '/libs'); // Get non-minified libs from source
    app.set('min', '');
    app.set('port', 3000);
}

app.use(favicon());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function (req, res) {
    var host = req.headers.host;
    if (host.substring(0, 4) === 'www.') {
        var dewwwhost = host.substring(4);
        res.render('index', {
            host: host,
            dewwwhost: dewwwhost,
            redirect: 'http://' + dewwwhost + req.url
        });
    }
    else {
        res.render('index', {
            host: host,
            dewwwhost: '',
            redirect: ''
        });
    }
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') !== 'production') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
}

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
