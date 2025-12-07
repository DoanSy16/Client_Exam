app.service("IndexedDBService", function ($q) {

    const DB_NAME = "ExamDB";
    const DB_VERSION = 1;

    // Danh sách các store bạn muốn tạo
    const STORES = [
        { name: "exam_questions", key: "id" },
        { name: "data_exam_mark", key: "id" },
        { name: "data_exam_mark_excel", key: "id" }
    ];

    let db = null;

    function openDB() {
        let deferred = $q.defer();

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => deferred.reject("Không mở DB");

        request.onsuccess = e => {
            db = e.target.result;
            deferred.resolve(db);
        };

        request.onupgradeneeded = e => {
            db = e.target.result;

            STORES.forEach(store => {
                if (!db.objectStoreNames.contains(store.name)) {
                    db.createObjectStore(store.name, { keyPath: store.key });
                }
            });
        };

        return deferred.promise;
    }

    // ---- SAVE ----
    this.save = function (storeName, data) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readwrite");
                const store = tx.objectStore(storeName);
                store.put(data);

                tx.oncomplete = () => resolve(true);
                tx.onerror = e => reject(e);
            });
        });
    };
    //---INSERT--
    this.insert = function (storeName, data) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readwrite");
                const store = tx.objectStore(storeName);

                // Gán id nếu store.key = "id"
                if (!data.id) {
                    data.id = Date.now();  // hoặc UUID
                }

                const req = store.add(data);

                req.onsuccess = () => resolve(true);
                req.onerror = e => reject(e);
            });
        });
    };



    // ---- GET ONE ----
    this.get = function (storeName, id) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readonly");
                const store = tx.objectStore(storeName);
                const req = store.get(id);
                req.onsuccess = e => resolve(e.target.result || null);
                req.onerror = e => reject(e);
            });
        });
    };

    // ---- GET ALL ----
    this.getAll = function (storeName) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readonly");
                const store = tx.objectStore(storeName);

                const req = store.getAll();

                req.onsuccess = e => resolve(e.target.result);
                req.onerror = e => reject(e);
            });
        });
    };

    // ---- DELETE ----
    this.delete = function (storeName, id) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readwrite");
                const store = tx.objectStore(storeName);

                store.delete(id);

                tx.oncomplete = () => resolve(true);
                tx.onerror = e => reject(e);
            });
        });
    };
    //Clear
    this.clear = function (storeName) {
        return openDB().then(() => {
            return $q((resolve, reject) => {
                const tx = db.transaction([storeName], "readwrite");
                const store = tx.objectStore(storeName);
                const req = store.clear();

                req.onsuccess = () => resolve(true);
                req.onerror = e => reject(e);
            });
        });
    };


});
