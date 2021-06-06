export default class DBInterface {
    static connect({DBName, version = 1}, storeNames) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DBName, version);

            request.onupgradeneeded = () => {
                const db = request.result;

                storeNames.forEach(({name, params = {}}) => {
                    if (!db.objectStoreNames.contains(name)) {
                        db.createObjectStore(name, params);
                    }
                });
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static getStore(db, name, mode = 'readwrite') {
        let transaction = db.transaction(name, mode);
        return transaction.objectStore(name);
    }

    static getRange(store, {from, to}) {
        return new Promise((resolve, reject) => {
            const request = store.getAll(IDBKeyRange.bound(from, to));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static getAll(store) {
        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}