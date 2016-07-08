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
  let values = { name : req.params.name, user_id : 0 };

  pool.query('INSERT INTO tracks SET ?', values, function(err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}

function getTracks(req, res, next) {
  let values = { name : req.params.name, user_id : 0 };

  pool.query('SELECT * FROM tracks', values, function(err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}

function getChecksForDay(req, res, next) {
  let currentUserId = 0,
      selectedDate = req.params.date ? req.params.date : (new Date()).toISOString().substring(0, 10),
      values = [ selectedDate, currentUserId, true ],
      query = 'SELECT t.id, t.name, c.checked FROM tracks t INNER JOIN days d on d.date = ? AND t.user_id = ? AND t.active = ? LEFT JOIN checks c ON d.id = c.day_id';

  console.log(mysql.format(query, values));
  pool.query(query, values, function (err, results, fields) {
    if (err) throw err;
    res.send(results);
  });
}

function setChecksForDay(req, res, next) {
  let currentDate = req.params.date ? req.params.date : (new Date()).toISOString().substring(0, 10),
      daysValues = [ currentDate, [ ] ],
      daysQuery = 'INSERT IGNORE into days SET date = ?';

  console.log(mysql.format(daysQuery));

  //TODO reduce this to one query if we know the user has a date already / check once for a date/user combo and cache it, validate the date_id to user_id in this service
  pool.query(daysQuery, daysValues, function (err, results, fields) {
    if (err) {
      throw err;
    } else {

      let checksValues = [result.insertId, 1],
          checksQuery = 'INSERT INTO checks (day_id, checked) VALUES ? ON DUPLICATE KEY UPDATE ';

      pool.query(checksQuery, checksValues, function (err, results, fields) {
        if (err) throw err;
        res.send(results);
      });
    }
  });
}

/**
 * API Endpoints
 */

server.get('/track/test', testDB);

server.get('/tracks', getTracks);

server.post('/track/:name', addTrack);

server.get('/day/:date', getChecksForDay);

server.post('/day/:date', setChecksForDay);

/**
 * Start the Server
 */

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
