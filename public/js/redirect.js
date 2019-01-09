window.onload = async () => {
    let urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("state") === localStorage.getItem("state")) {
        let authCode = urlParams.get("code");
        let url = "/auth/bungie";
        fetch(url, {
            headers: {
                "auth_code": authCode
            }
        })
            .then(response => response.json())
            .then(json => {
                var date = new Date();
                let accessTokenExpiry = date.getTime() + (json.expires_in * 1000);
                let refreshTokenExpiry = date.getTime() + (json.refresh_expires_in * 1000);

                localStorage.setItem("access_token", JSON.stringify(json.access_token));
                localStorage.setItem("expires_in", JSON.stringify(accessTokenExpiry));
                localStorage.setItem("membership_id", JSON.stringify(json.membership_id));
                localStorage.setItem("refresh_expires_in", JSON.stringify(refreshTokenExpiry));
                localStorage.setItem("refresh_token", JSON.stringify(json.refresh_token));
                window.location.href = "/";
            })
            .catch(error => console.log(error));
    } else {
        console.log("mismatched states");
    }
}