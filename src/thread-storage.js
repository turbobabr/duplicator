const Storage = {
  _storage() {
    return NSThread.currentThread().threadDictionary();
  },

  set(key,value) {
    this._storage()[key] = value;
  },
  get(key) {
    return this._storage()[key];
  },
  exists(key) {
    return this.get(key) ? true : false;
  }
};

export default Storage;