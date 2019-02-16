import alt from "../alt";

class ComparisonActions {
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

export default alt.createActions(ComparisonActions);