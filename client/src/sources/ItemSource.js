class ItemSource {
    async fetch() {
        return fetch("/api/items").then(json => json.json());
    }
}

export default ItemSource;