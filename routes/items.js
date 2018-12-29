var express = require('express');
var router = express.Router();
var path = require('path');

/* GET armour items. */
router.get('/', function(req, res, next) {
  res.header('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, '../public/data/items.json'));
});

module.exports = router;