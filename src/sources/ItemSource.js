class ItemSource {
    async fetch() {
        let accessToken = localStorage.getItem("access_token");
        return fetch("/api/items", {
            headers: {
                "access_token": accessToken
            }
        }).then(json => json.json());
    }
}

export default ItemSource;