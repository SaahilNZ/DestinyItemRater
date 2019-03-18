export default class MockStore<T> {
    data: T;

    constructor(data: T) {
        this.data = data;
    }

    getState(): T {
        return this.data;
    }
}