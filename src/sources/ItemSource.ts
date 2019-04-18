import DestinyAccount from "../model/DestinyAccount";

class ItemSource {
    async fetch(account: DestinyAccount) {
        let accessToken = localStorage.getItem("access_token");
        return fetch(`/api/items?membership_type=${account.membershipType}&membership_id=${account.membershipId}`, {
            headers: {
                "access_token": accessToken
            }
        }).then(json => json.json());
    }
}

export default ItemSource;