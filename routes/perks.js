var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var papa = require('papaparse');

/* GET armour perks. */
router.get('/', function(req, res, next) {
  res.header('Content-Type', 'application/json');
  var file = fs.readFileSync(path.join(__dirname, '../public/data/d2-armour-perks.csv'));
  res.send(convertToJson(papa.parse(file.toString())));
});

function convertToJson(data) {
  let perks = [];
  data.data.slice(1).forEach(perk => {
    if(perk[0].trim() !== '') {
      let upgrades = [];
      if (perk[2] !== '') {
          upgrades.push(perk[2]);
      }
      if (perk[3] !== '') {
          upgrades.push(perk[3]);
      }
      perks.push({
        name: perk[0],
        isGood: (perk[1] === 'good'),
        upgrades: upgrades
      });
    }
  });
  return JSON.stringify({ perks: perks });
}

module.exports = router;
