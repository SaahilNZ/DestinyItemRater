import ItemDefinitionActions from '../actions/ItemDefinitionActions';
import alt from '../alt';

class ItemDefinitionStore {
    constructor() {
        this.itemDefinitions = new Map();
        this.errorMessage = null;
        this.bindListeners({
            handleUpdateItemDefinitions: ItemDefinitionActions.UPDATE_ITEM_DEFINITIONS,
            handleFetchItemDefinitions: ItemDefinitionActions.FETCH_ITEM_DEFINITIONS,
            handleItemDefinitionsFailed: ItemDefinitionActions.ITEM_DEFINITIONS_FAILED
        });
    }

    handleUpdateItemDefinitions(itemDefinitions) {
        this.itemDefinitions = itemDefinitions;
        this.errorMessage = null;
    }

    handleFetchItemDefinitions() {
        this.itemDefinitions = new Map();
    }

    handleItemDefinitionsFailed(errorMessage) {
        this.errorMessage = errorMessage;
    }
}

export default alt.createStore(ItemDefinitionStore, 'ItemDefinitionStore');