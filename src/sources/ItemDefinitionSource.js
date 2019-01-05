class ItemDefinitionSource {
    async fetch() {
        return await fetch("/api/itemdefinitions")
            .then(response => response.text())
            .then(json => JSON.parse(json))
            .then(data => this.populateItemDefinitionMap(data))
            .catch(error => console.log(error));
    }

    populateItemDefinitionMap(data) {
        let map = new Map();
        data.itemDefinitions.forEach(itemDef => {
            map.set(itemDef.hash, {
                name: itemDef.name,
                itemType: itemDef.itemType,
                class: itemDef.classType
            });
        });
        return map;
    }
}

export default ItemDefinitionSource;