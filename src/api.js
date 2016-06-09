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

server.get('/track/test', testDB);

server.post('/track/:name', addTrack)

server.head('/hello/:name', test);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});