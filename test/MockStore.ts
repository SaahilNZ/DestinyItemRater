export default class MockStore {
    data: Object;

    constructor(data: Object) {
        this.data = data;
    }

    getState() {
        return this.data;
    }
}