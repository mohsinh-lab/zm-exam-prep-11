import { vi } from 'vitest';

const localStorageMock = (function () {
    let store = {};
    return {
        getItem: vi.fn(key => store[key] || null),
        setItem: vi.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn(key => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        })
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

Object.defineProperty(window, 'sessionStorage', {
    value: localStorageMock
});

Object.defineProperty(window, 'dispatchEvent', {
    value: vi.fn()
});

// Mock IndexedDB
class MockIndexedDB {
  constructor() {
    this.databases = {};
  }

  open(dbName, version) {
    const self = this;
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    };

    setTimeout(() => {
      if (!self.databases[dbName]) {
        self.databases[dbName] = new MockDatabase(dbName, version);

        // Trigger onupgradeneeded
        if (request.onupgradeneeded) {
          request.onupgradeneeded({
            target: {
              result: self.databases[dbName]
            }
          });
        }
      }

      request.result = self.databases[dbName];
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  deleteDatabase(dbName) {
    delete this.databases[dbName];
    return { onsuccess: null, onerror: null };
  }
}

class MockObjectStore {
  constructor(name) {
    this.name = name;
    this.data = new Map();
    this.indexes = {};
  }

  put(entry) {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      this.data.set(entry.passageId, entry);
      request.result = entry.passageId;
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  get(key) {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      request.result = this.data.get(key) || null;
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  getAll() {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      request.result = Array.from(this.data.values());
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  delete(key) {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      this.data.delete(key);
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  clear() {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      this.data.clear();
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }

  index(name) {
    if (!this.indexes[name]) {
      this.indexes[name] = new MockIndex(name, this);
    }
    return this.indexes[name];
  }

  createIndex(name, keyPath, options) {
    this.indexes[name] = new MockIndex(name, this);
    return this.indexes[name];
  }
}

class MockIndex {
  constructor(name, store) {
    this.name = name;
    this.store = store;
  }

  getAll() {
    const request = {
      result: null,
      error: null,
      onsuccess: null,
      onerror: null
    };

    setTimeout(() => {
      request.result = Array.from(this.store.data.values());
      if (request.onsuccess) {
        request.onsuccess();
      }
    }, 0);

    return request;
  }
}

class MockTransaction {
  constructor(db, storeNames) {
    this.db = db;
    this.storeNames = storeNames;
  }

  objectStore(name) {
    if (!this.db.objectStores[name]) {
      this.db.objectStores[name] = new MockObjectStore(name);
      this.db.objectStoreNames.add(name);
    }
    return this.db.objectStores[name];
  }
}

class MockDatabase {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.objectStoreNames = {
      _names: new Set(),
      contains: function(name) {
        return this._names.has(name);
      },
      add: function(name) {
        this._names.add(name);
      }
    };
    this.objectStores = {};
  }

  createObjectStore(name, options) {
    const store = new MockObjectStore(name);
    this.objectStores[name] = store;
    this.objectStoreNames.add(name);
    return store;
  }

  transaction(storeNames, mode) {
    return new MockTransaction(this, storeNames);
  }

  close() {
    // Mock close
  }
}

const mockIndexedDB = new MockIndexedDB();

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});
