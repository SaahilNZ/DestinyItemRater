var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
require('dotenv').config();

router.get('/', function(req, res) {
    var membershipId = req.headers.membership_id;
    let url = `https://www.bungie.net/platform/User/GetMembershipsById/${JSON.parse(membershipId)}/-1/`;
    fetch(url, {
        headers: {
            'X-Api-Key': process.env.BUNGIE_API_KEY
        }
    })
        .then(response => response.json())
        .then(response => res.send(response))
        .catch(error => console.log(error));
});

module.exports = router;