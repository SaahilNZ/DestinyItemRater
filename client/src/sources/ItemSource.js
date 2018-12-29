class ItemSource {
    async fetch() {
        return fetch("/items").then(json => json.json());
    }
}

export default ItemSource;