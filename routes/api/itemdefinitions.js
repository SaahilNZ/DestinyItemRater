var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res, next) {
    res.header('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, '../../build/data/ItemDefinitions.json'));
});

module.exports = router;