import DestinyItemDefinition from "../model/DestinyItemDefinition";

class ItemDefinitionSource {
    async fetch(): Promise<Map<string, DestinyItemDefinition>> {
        return await fetch("/api/itemdefinitions")
            .then(response => response.text())
            .then(json => JSON.parse(json))
            .then(data => this.populateItemDefinitionMap(data))
            .catch(error => {
                console.log(error);
                throw error;
            });
    }

    populateItemDefinitionMap(data): Map<string, DestinyItemDefinition> {
        let map = new Map<string, DestinyItemDefinition>();
        data.itemDefinitions.forEach(itemDef => {
            map.set(itemDef.hash, {
                hash: itemDef.hash,
                name: itemDef.name,
                itemType: itemDef.itemType,
                tier: itemDef.tier,
                class: itemDef.classType
            });
        });
        return map;
    }
}

export default ItemDefinitionSource;