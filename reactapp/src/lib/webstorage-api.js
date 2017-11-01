
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
            listsItem[listId] = {
                meta: Object.assign(
                    {name: "New list", pts: "2000", army: "-"},
                    newMeta,
                    {id: listId, count: 0}),
                units: {}
            };
            _setStorageObject(type, listsItem);
            successCallback(listsItem, listId);
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
        } else if (!listsItem.hasOwnProperty(listId)) {
            errorCallback('list_not_found', type+'-'+listId);
        } else {
            const deletedList = listsItem[listId];
            delete listsItem[deletedList.meta.id];
            _setStorageObject(type, listsItem);
            successCallback(listsItem, deletedList);
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

    setMeta: function(type, listId, newMeta, successCallback, errorCallback) {
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
            Object.assign(listsItem[listId].meta, newMeta);
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    addUnit: function(type, listId, unitkey, successCallback, errorCallback) {
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
            const unitId = Math.floor(Date.now()/100).toString(32);
            listsItem[listId].units[unitId] = unitkey;
            listsItem[listId].meta.count += 1;
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    modifyUnit: function(type, listId, unitId, values, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem.hasOwnProperty(listId)) {
            errorCallback('list_not_found', type+'-'+listId);
        } else if (!listsItem[listId].units.hasOwnProperty(unitId)) {
            errorCallback('unit_not_found', type+'-'+listId+'-'+unitId);
        } else {
            Object.assign(listsItem[listId].units[unitId], values);
            _setStorageObject(type, listsItem);
            successCallback(listsItem);
        }
    },

    removeUnit: function(type, listId, unitId, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        const listsItem = _getStorageObject(type);
        if (listsItem === null) {
            errorCallback('store_not_initialized', type);
        } else if (!listsItem.hasOwnProperty(listId)) {
            errorCallback('list_not_found', type+'-'+listId);
        } else if (!listsItem[listId].units.hasOwnProperty(unitId)) {
            errorCallback('unit_not_found', type+'-'+listId+'-'+unitId);
        } else {
            const deletedUnit = { id: unitId, unitkey: listsItem[listId].units[unitId] };
            delete listsItem[listId].units[deletedUnit.id];
            listsItem[listId].meta.count -= 1;
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

