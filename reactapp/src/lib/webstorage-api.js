
function _getStorageObject(type) {
    const storageItem = localStorage.getItem(type);
    if (storageItem === null) return null;
    return JSON.parse(storageItem);
}

function _setStorageObject(type, obj) {
    localStorage.setItem(type, JSON.stringify(obj));
}

const webstorage_api = {

    errorLogger: function(errorCode, errorMessage = '') {
        console.log(errorCode + ': ' + errorMessage);
    },

    /*
     * Functions for general localStorage interaction:
     */

    initItem: function(type, initValue, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        if (localStorage.getItem(type) === null) {
            _setStorageObject(type, (initValue) ? initValue : {} );
        } else {
            successCallback(_getStorageObject(type));
        }
    },

    removeItem: function(type, successCallback, errorCallback){
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const storageItem = _getStorageObject(type);
        if (storageItem === null) {
            errorCallback('store_not_initialized', type);
        } else {
            localStorage.removeItem(type);
            successCallback(storageItem);
        }
    },

    modifyObjectItem: function(type, values, successCallback, errorCallback){
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const storageItem = _getStorageObject(type);
        if (storageItem === null) {
            errorCallback('store_not_initialized', type);
        } else {
            const modifiedItem = Object.assign({}, storageItem, values);
            _setStorageObject(type, modifiedItem);
            successCallback(modifiedItem);
        }
    },

    setItem: function(type, value, successCallback, errorCallback){
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        _setStorageObject(type, value);
        successCallback(value);
    },

    /*
     * Functions for armylist-specific localStorage interaction:
     */

    newList: function(type, newMeta, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else {
            const listId = 'x'+Math.floor(Date.now()/100).toString(32);
            const newList = {
                meta: Object.assign(
                    {name: "New list", pts: "2000", army: "-"},
                    newMeta,
                    {id: listId, count: 0}),
                units: []
            };
            const updatedLists = [newList, ...listsItem];
            _setStorageObject(type, updatedLists);
            successCallback(updatedLists, 0); // Return index of new list: 0
        }
    },

    removeList: function(type, listId, successCallback, errorCallback) {
        if(!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
            return;
        }
        const deletedList = listsItem.find( list => list.meta.id === listId );
        if (!deletedList) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else {
            const updatedLists = listsItem.filter( list => list.meta.id != listId );
            _setStorageObject(type, updatedLists);
            successCallback(updatedLists, deletedList);
        }
    },

    setMeta: function(type, listIndex, newMeta, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else {
            Object.assign(listsItem[listIndex].meta, newMeta);
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    addUnit: function(type, listIndex, unitkey, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else {
            const unitId = Math.floor(Date.now()/100).toString(32);
            listsItem[listIndex].units.push({
                id: unitId,
                key: unitkey
            });
            listsItem[listIndex].meta.count += 1;
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    modifyUnit: function(type, listIndex, unitIndex, newUnitKey, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else if (!listsItem[listIndex].units[unitIndex]) {
            errorCallback('unit_not_found', type+'- listIndex '+listIndex+'- unitIndex '+unitIndex);
        } else {
            listsItem[listIndex].units[unitIndex].key = newUnitKey;
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    removeUnit: function(type, listIndex, unitIndex, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else if (!listsItem[listIndex].units[unitIndex]) {
            errorCallback('unit_not_found', type+'- listIndex '+listIndex+'- unitIndex '+unitIndex);
        } else {
            const deletedUnit = listsItem[listIndex].units[unitIndex];
            listsItem[listIndex].units = [
                ...listsItem[listIndex].units.slice(0,unitIndex),
                ...listsItem[listIndex].units.slice(unitIndex + 1)
            ];
            listsItem[listIndex].meta.count -= 1;
            _setStorageObject(type, listsItem);
            successCallback(listsItem, deletedUnit);
        }
    },

    getAllLists: function(type, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else {
            successCallback(listsItem);
        }
    },
}

export default webstorage_api;

