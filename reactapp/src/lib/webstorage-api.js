
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
        }
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
                units: {}
            };
            const updatedLists = [newList, ...listsItem];
            _setStorageObject(type, updatedLists);
            successCallback(updatedLists, listId);
        }
    },

    removeList: function(type, listIndex, successCallback, errorCallback) {
        if(!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
            return;
        }
        const deletedList = listsItem[listIndex];
        if (!deletedList) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else {
            const updatedLists = [
                ...listsItem.slice(0,listIndex),
                ...listsItem.slice(listIndex + 1)
            ];
            _setStorageObject(type, updatedLists);
            successCallback(updatedLists, deletedList);
        }
    },
    
    /* Currently not used */
    getList: function(type, listId, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem.hasOwnProperty(listId)) {
            errorCallback('list_not_found', type+'-'+listId);
        } else {
            successCallback(listsItem[listId]);
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
            listsItem[listIndex].units[unitId] = unitkey;
            listsItem[listIndex].meta.count += 1;
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    modifyUnit: function(type, listIndex, unitId, values, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else if (!listsItem[listIndex].units.hasOwnProperty(unitId)) {
            errorCallback('unit_not_found', type+'- listIndex '+listIndex+'-'+unitId);
        } else {
            Object.assign(listsItem[listIndex].units[unitId], values);
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    removeUnit: function(type, listIndex, unitId, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem[listIndex]) {
            errorCallback('list_not_found', type+'- listIndex '+listIndex);
        } else if (!listsItem[listIndex].units.hasOwnProperty(unitId)) {
            errorCallback('unit_not_found', type+'-'+listIndex+'-'+unitId);
        } else {
            const deletedUnit = { id: unitId, unitkey: listsItem[listIndex].units[unitId] };
            delete listsItem[listIndex].units[deletedUnit.id];
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

