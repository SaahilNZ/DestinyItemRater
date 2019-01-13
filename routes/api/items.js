var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
require('dotenv').config();

/* GET armour items. */
router.get('/', function(req, res, next) {
    var selectedProfile = JSON.parse(req.headers.selected_profile)
    var profileId = selectedProfile.membershipId;
    var platformId = selectedProfile.membershipType;
    var accessToken = JSON.parse(req.headers.access_token);
    var url = `https://www.bungie.net/Platform/Destiny2/${platformId}/Profile/${profileId}/?components=102%2C103%2C200%2C201%2C202%2C205%2C300%2C301%2C304%2C305%2C306%2C307%2C308`;
    fetch(url, {
        headers: {
            "x-Api-Key": process.env.BUNGIE_API_KEY,
            "Authorization": `Bearer ${accessToken}`
        }
    })
        .then(response => response.json())
        .then(response => res.send(response))
        .catch(error => console.log(error));
});

module.exports = router;