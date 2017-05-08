/**
 * Created by KE on 2017/4/26.
 */

var GamePersistency = {
    new: function () {
        var gamePersistency = {};
        gamePersistency._initDB = function () {
            this._request = window.indexedDB.open("game", 1);
            this._request.onerror = function (event) {
                this._dbConn = null;
            }.bind(gamePersistency);
            this._request.onsuccess = function (event) {
                this._dbConn = event.target.result;
            }.bind(gamePersistency);
            this._request.onupgradeneeded = function (event) {
                this._dbConn = event.target.result;

                // Create an objectStore to hold information about our customers. We're
                // going to use "ssn" as our key path because it's guaranteed to be
                // unique - or at least that's what I was told during the kickoff meeting.
                var objectStore = this._dbConn.createObjectStore("game", {keyPath: "name"});

                // Create an index to search customers by name. We may have duplicates
                // so we can't use a unique index.
                objectStore.createIndex("name", "name", {unique: false});
            }.bind(gamePersistency);
        }.bind(gamePersistency);
        gamePersistency.saveGame = function (gameState) {
            if (this._dbConn) {
                var key = "halma"
                var queryTrans = this._dbConn.transaction(["game"], "readwrite");
                var store = queryTrans.objectStore("game");
                var request = store.get(key);
                var updateTrans = this._dbConn.transaction(["game"], "readwrite");
                store = updateTrans.objectStore("game");
                request.onsuccess = function (event) {
                    if (request.result) {
                        store.put(gameState);
                    }
                    else {
                        store.add(gameState);
                    }
                };
            }
        }.bind(gamePersistency);

        gamePersistency.loadGame = function (CB) {
            if (this._dbConn) {
                var transaction = this._dbConn.transaction(["game"], "readonly");
                var store = transaction.objectStore("game");
                var gameStateRequest = store.get("halma");
                gameStateRequest.onerror=function(event)
                {
                    console.error(event);
                    CB(null);
                };
               gameStateRequest.onsuccess=function (event) {
                    CB(gameStateRequest.result);
                }
            }
        }.bind(gamePersistency);
        gamePersistency._initDB();
        return gamePersistency;
    }
};