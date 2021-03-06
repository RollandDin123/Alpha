var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');





var routes = require('./routes');
var users = require('./routes/user');
var checkauth = require('./utils/checkauth');
var auth = require('./routes/auth');
var chat = require('./routes/chat');
var reg = require('./routes/reg');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//insert data

var Maintext  = require('./models/maintext').maintext;

var maintext = new Maintext ({
	name: 'Добро пожаловать на сайт',
	body: 'dsfsdfsdf',
	url: 'index'
});

var maintext = new Maintext({
	name: 'Contact to USA',
	body: '',
	url: 'contact'
});

var maintext = new Maintext({
	name: 'Our current development',
	body: '',
	url: 'projects'
});


maintext.save(function(err, user){
	console.log('Улыбаемся и пашем!');
});

//end

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

app.use(express.bodyParser({keepExtensions:true, uploadDir: 'public/tmp'}))

app.use(express.session({
	secret: 'abc123',
	key: 'sid'
}));

app.use(function(req, res, next){
	res.locals = {
		userid: req.session.user
	};
	next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get('/', routes.index);
app.get('/users', users.list);
app.get('/reg', reg.index);
app.get('/cobinet', checkauth, auth.cobinet);
app.get('/logout', checkauth, reg.logout);
app.get('/chat', chat.index);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/chat');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

app.get('/:id', routes.index);


//post
app.post('/reg', reg.send);
app.post('/cobinet', checkauth, auth.send);
//end

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

http.listen(config.get('port'), function(){
  console.log('listening on *:'+config.get('port'));
});
//http.listen(config.get('port'));
module.exports = app;