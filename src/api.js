"use strict";

const CONFIG = require('../config');
var restify = require('restify');
var mysql = require('mysql');

var server = restify.createServer();
server.use(restify.bodyParser());

var pool  = mysql.createPool({
  connectionLimit : CONFIG.db.connectionLimit,
  host     : CONFIG.db.host,
  user     : CONFIG.db.user,
  database : CONFIG.db.database
});


/**
 * API Methods
 */

function test(req, res, next) {
  res.send('oh hi ' + req.params.name);
  next();
}

function testDB(req, res, next) {
  pool.query('DESCRIBE tracks', function(err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}

function addTrack(req, res, next) {
  let post = { name : req.params.name, user_id : 0 };
  pool.query('INSERT INTO tracks SET ?', post, function(err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}

function getTracks(req, res, next) {
  let post = { name : req.params.name, user_id : 0 };
  pool.query('SELECT * FROM tracks', post, function(err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}


/**
 * API Endpoints
 */

server.get('/track/test', testDB);

server.get('/tracks', getTracks);

server.post('/track/:name', addTrack)


/**
 * Start the Server
 */

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
