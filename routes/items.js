var express = require('express');
var router = express.Router();
var items = require('../public/data/items.json');

/* GET armour items. */
router.get('/', function(req, res, next) {
  res.header('Content-Type', 'application/json');
  res.send(JSON.stringify(items));
});

module.exports = router;
