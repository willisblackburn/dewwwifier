var _ = require('lodash-node');
var debug = require('debug')('dewwwifier');
var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var path = require('path');
var async = require('async');
var HttpStatus = require('http-status');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', require('hjs').__express);

if ('production' === app.get('env')) {
    app.use(logger('default'));
    app.set('libs', '//cdnjs.cloudflare.com/ajax/libs'); // Get minified libs from cloud
    app.set('min', '.min');
    app.set('site', 'dewwwifier.com');
    app.set('port', 8000);
}
else {
    app.use(logger('dev'));
    app.set('libs', '/libs'); // Get non-minified libs from source
    app.set('min', '');
    app.set('site', 'pumpkin.local:8000');
    app.set('port', 8000);
}

app.use(favicon());
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', function (req, res, next) {
    var host = req.headers.host;
    // If the request is for the dewwwifier.com site itself, then go to the next handler.
    if (host === app.get('site'))
        next();
    else if (host.substring(0, 4) === 'www.') {
        var dewwwhost = host.substring(4);
        res.render('redirect', {
            host: host,
            dewwwhost: dewwwhost,
            redirect: 'http://' + dewwwhost + req.url,
            site: app.get('site')
        });
    }
    else {
        res.render('unexpected', {
            host: host,
            site: app.get('site')
        });
    }
});

app.get('/', function (req, res) {
    res.render('index', {
        site: app.get('site')
    });
});

// Any other get returns 404.

app.get('*', function (req, res) {
    res.send(HttpStatus.NOT_FOUND);
});

// If I get any other type of request, just send a bad request error.

app.all('*', function (req, res) {
    res.send(HttpStatus.METHOD_NOT_ALLOWED);
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
