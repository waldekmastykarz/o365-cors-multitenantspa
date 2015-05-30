/// <reference path="typings/node/node.d.ts"/>
(function () {
    'use strict';

	var express = require('express'),
        session = require('express-session'),
        cookieParser = require('cookie-parser'),
        app = express(),
        config = require('./config'),
		FileStore = require('session-file-store')(session);

	app.use(cookieParser('6817da99-7959-46d7-a32e-bae31b4dca26'));
	app.use(session({
		store: new FileStore(),
		secret: 'dae6f48c-cc3e-4ee2-94da-ce1bd2c69ad1',
		resave: false,
		saveUninitialized: true
	}));
	
	var apiRouter = require('./controllers/apiController.js');

	app.use('/', express.static(__dirname + "/public"));
	app.get('/', function (req, res, next) {
		res.sendFile(__dirname + '/public/app.html');
	});
	app.use("/api", apiRouter);
	
	var http = require('http'),
		httpServer = http.createServer(app);
	httpServer.listen(config.port, process.env.WEBSITE_SITE_NAME || 'localhost');

	console.log('Web server listening on %s...', config.appRootUrl);
})();