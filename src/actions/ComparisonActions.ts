import alt from "../alt";
import AbstractActionsModel from "./AbstractActionsModel";

interface AltComparisonActions {
    compareItems(): void;
    onItemsCompared(dispatch: any): any;
}

class ComparisonActions extends AbstractActionsModel {
    compareItems() {
        return (dispatch) => {
            dispatch();
            this.onItemsCompared();
        }
    }

    onItemsCompared() {
        return (dispatch) => dispatch();
    }
}

export default alt.createActions<AltComparisonActions>(ComparisonActions);