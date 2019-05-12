var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs");
var papa = require("papaparse");

/* GET armour perks. */
router.get("/", function (req, res, next) {
    res.header("Content-Type", "application/json");
    var file = fs.readFileSync(
        path.join(__dirname, "../../public/data/d2-armour-perks.csv")
    );
    res.send(convertToJson(papa.parse(file.toString())));
});

function convertToJson(data) {
    let perks = [];
    data.data.slice(1).forEach(row => {
        const [perkName, pveRating, pvpRating, upgrade1, upgrade2] = row;

        if (perkName.trim() !== "") {
            perks.push({
                name: perkName,
                isGoodByMode: {
                    'PvE': pveRating === 'good',
                    'PvP': pvpRating === 'good',
                },
                upgrades: [upgrade1, upgrade2].filter(u => u)
            });
        }
    });
    return JSON.stringify({ perks: perks });
}

module.exports = router;
