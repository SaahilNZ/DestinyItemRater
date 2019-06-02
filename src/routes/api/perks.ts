import express from "express";
import path from "path";
import fs from "fs";
import papa from "papaparse";
import PerkRating from "../../app/model/PerkRating";

const router = express.Router();
router.get("/", (req, res) => {
    res.header("Content-Type", "application/json");
    var file = fs.readFileSync(
        path.join(__dirname, "./data/d2-armour-perks.csv"));
    res.send(convertToJson(papa.parse(file.toString())));
});

function convertToJson(data: papa.ParseResult): string {
    let perks: PerkRating[] = [];
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

export default router;