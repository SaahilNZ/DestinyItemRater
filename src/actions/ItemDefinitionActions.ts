import alt from "../alt";
import ItemDefinitionSource from "../sources/ItemDefinitionSource";
import AbstractActionsModel from "./AbstractActionsModel";
import DestinyItemDefinition from "../model/DestinyItemDefinition";

interface AltItemDefinitionActions {
    updateItemDefinitions(itemDefinitions: Map<number, DestinyItemDefinition>): Map<number, DestinyItemDefinition>;
    fetchItemDefinitions(): (dispatch: any) => void;
    itemDefinitionsFailed(errorMessage: string): string;
}

class ItemDefinitionActions extends AbstractActionsModel implements AltItemDefinitionActions {
    updateItemDefinitions(itemDefinitions: Map<number, DestinyItemDefinition>): Map<number, DestinyItemDefinition> {
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

    itemDefinitionsFailed(errorMessage: string): string {
        return errorMessage;
    }
}

export default alt.createActions<AltItemDefinitionActions>(ItemDefinitionActions);