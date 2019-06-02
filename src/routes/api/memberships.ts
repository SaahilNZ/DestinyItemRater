import express from "express";
import fetch from "node-fetch";

const router = express.Router();
router.get('/', (req, res) => {
    let membershipId = req.headers.membership_id as string;
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

export default router;