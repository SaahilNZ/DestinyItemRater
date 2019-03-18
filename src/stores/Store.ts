interface Store<T> {
    getState(): T;
}

export default Store;