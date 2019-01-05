import alt from "../alt";
import ItemDefinitionSource from "../sources/ItemDefinitionSource";

class ItemDefinitionActions {
    updateItemDefinitions(itemDefinitions) {
        return itemDefinitions;
    }
    
    fetchItemDefinitions() {
        return async (dispatch) => {
            dispatch();
            let source = new ItemDefinitionSource();
            try {
                let itemDefinitions = await source.fetch();
                this.updateItemDefinitions(itemDefinitions);
            } catch(e) {
                this.itemDefinitionsFailed(e.message);
            }
        }
    }
    
    itemDefinitionsFailed(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(ItemDefinitionActions);