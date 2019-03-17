export default class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
    bindListeners(config:{[methodName:string]:AltJS.Action<any> | AltJS.Actions}):void {
    }

    getState: () => S;
}
