import express from "express";
import fetch from "node-fetch";

const router = express.Router();
router.get('/', (req, res) => {
    let profileId = req.query.membership_id as string;
    let platformId = req.query.membership_type as string;
    let accessToken = JSON.parse(req.headers.access_token as string);
    let url = `https://www.bungie.net/Platform/Destiny2/${platformId}/Profile/${profileId}/?components=102%2C103%2C200%2C201%2C202%2C205%2C300%2C301%2C304%2C305%2C306%2C307%2C308`;
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

export default router;