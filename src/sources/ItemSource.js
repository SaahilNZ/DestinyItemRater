class ItemSource {
    async fetch() {
        return fetch("data/items.json").then(json => json.json());
    }
}

export default ItemSource;