export default class MockStore {
    constructor(data) {
        this.data = data;
    }

    getState() {
        return this.data;
    }
}