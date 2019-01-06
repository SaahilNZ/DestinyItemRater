import alt from "../alt";
import ItemDefinitionSource from "../sources/ItemDefinitionSource";

class ItemDefinitionActions {
    updateItemDefinitions(itemDefinitions) {
        return itemDefinitions;
    }
    
    fetchItemDefinitions() {
        return (dispatch) => {
            dispatch();
            let source = new ItemDefinitionSource();
            source.fetch()
                .then(itemDefinitions => {
                    this.updateItemDefinitions(itemDefinitions);
                })
                .catch(errorMessage => {
                    this.itemDefinitionsFailed(errorMessage);
                });
        }
    }
    
    itemDefinitionsFailed(errorMessage) {
        return errorMessage;
    }
}

export default alt.createActions(ItemDefinitionActions);