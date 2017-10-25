
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

    initItem: function(type, successCallback, errorCallback) {
        if (!window.localStorage) {
            errorCallback('webstorage_not_available');
            return;
        }
        if (localStorage.getItem(type) === null) {
            _setStorageObject(type, {});
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

    modifyItem: function(type, values, successCallback, errorCallback){
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
            const listId = 'li'+Math.floor(Date.now()/1000).toString();
            listsItem[listId] = {
                meta: Object.assign(
                    {name: "New list", pts: "2000", army: "-"},
                    newMeta,
                    {id: listId, count: 0}),
                units: {}
            };
            _setStorageObject(type, listsItem);
            successCallback(listsItem[listId]);
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
            const list = listsItem[listId];
            delete listsItem[listId];
            _setStorageObject(type, listsItem);
            successCallback(list);
        }
    },
    
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
            successCallback(listsItem[listId]);
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
            const unitId = 'un'+Date.now().toString();
            listsItem[listId].units[unitId] = unitkey;
            listsItem[listId].meta.count += 1;
            _setStorageObject(type, listsItem);
            successCallback(listsItem[listId]);
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
            successCallback(listsItem[listId]);
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
            const unit = listsItem[listId].units[unitId];
            delete listsItem[listId].units[unitId];
            listsItem[listId].meta.count -= 1;
            _setStorageObject(type, listsItem);
            successCallback(unit);
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
            for (const [id, list] of Object.entries(listsItem)) {
                delete list.units;
            }
            successCallback(listsItem);
        }
    },
}

export default webstorage_api;

