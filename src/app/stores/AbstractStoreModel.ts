export default class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
    bindListeners(obj:any):void {}

    getState: () => S;
}
