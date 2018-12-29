var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

/* GET armour perks. */
router.get('/', function(req, res, next) {
  res.header('Content-Type', 'text/csv');
  res.sendFile(path.join(__dirname, '../public/data/d2-armour-perks.csv'));
});

module.exports = router;
