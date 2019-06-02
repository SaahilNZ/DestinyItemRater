import express from "express";
import querystring from "querystring";
import fetch from "node-fetch";

const TOKEN_URL = 'https://www.bungie.net/platform/app/oauth/token/';

const router = express.Router();

router.get('/', (req, res) => {
    let code = req.headers.auth_code;
    fetch(TOKEN_URL, {
        method: "POST",
        body: querystring.stringify({
            grant_type: 'authorization_code',
            code,
            client_id: `${process.env.BUNGIE_CLIENT_ID}`,
            client_secret: `${process.env.BUNGIE_CLIENT_SECRET}`
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(response => res.send(response))
        .catch(error => console.log(error));
});

router.get('/refresh', function (req, res) {
    var refresh = JSON.parse(req.headers.refresh_token as string);
    fetch(TOKEN_URL, {
        method: "POST",
        body: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh,
            client_id: `${process.env.BUNGIE_CLIENT_ID}`,
            client_secret: `${process.env.BUNGIE_CLIENT_SECRET}`
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
        .then(response => response.json())
        .then(response => res.send(response))
        .catch(error => console.log(error));
});

export default router;