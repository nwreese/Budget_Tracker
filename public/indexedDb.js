 function saveRecord(transaction){
useIndexedDb("budget", "budgetStore", "post", transaction)
}

function getRecord(){
   return useIndexedDb("budget", "budgetStore", "get")
}

function checkForIndexedDb() {
    if (!window.indexedDB) {
      console.log("Your browser doesn't support a stable version of IndexedDB.");
      return false;
    }
    return true;
  }
  function uploadTracker(){
    useIndexedDb("budget", "budgetStore", "upload")
  }

  function useIndexedDb(databaseName, storeName, method, object) {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1);
      let db,
        tx,
        store;
  
      request.onupgradeneeded = function(e) {
        const db = request.result;
        db.createObjectStore(storeName, { autoIncrement: true });
      };
  
      request.onerror = function(e) {
        console.log("There was an error");
      };
   
      request.onsuccess = function(e) {
        db = request.result;
        tx = db.transaction(storeName, "readwrite");
        store = tx.objectStore(storeName);
  
        db.onerror = function(e) {
          console.log("error");
        };
        if (method === "put") {
          store.put(object);
        }
        else if (method === "post") {
            store.add(object);
        } else if (method === "upload"){
    const getAll = store.getAll();
     getAll.onsuccess = function() {
     if (getAll.result.length > 0) {
       fetch('/api/transaction', {
         method: 'POST',
         body: JSON.stringify(getAll.result),
         headers: {
           Accept: 'application/json, text/plain, */*',
           'Content-Type': 'application/json'
         }
       })
         .then(response => response.json())
         .then(serverResponse => {
           if (serverResponse.message) {
             throw new Error(serverResponse);
           }
           const transaction = db.transaction(['new_budget'], 'readwrite');
           const store = transaction.objectStore('new_budget');
  
          store.clear();
           alert('All saved transactions has been submitted!');
         })
         .catch(err => {
           console.log(err);
         });
     }
   };
        }
         else if (method === "get") {
          const all = store.getAll();
          all.onsuccess = function() {
            resolve(all.result);
          };
        } else if (method === "delete") {
          store.delete(object._id);
        }
        tx.oncomplete = function() {
          db.close();
        };
      };
    });
  }
window.addEventListener('online', uploadTracker);