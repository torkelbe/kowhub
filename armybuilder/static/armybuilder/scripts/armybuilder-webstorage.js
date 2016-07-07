
storageEngine = function() {
    var initialized = false;
    var initializedObjectStores = {};

    function getStorageObject(type) {
        var item = localStorage.getItem(type);
        var parsedItem = JSON.parse(item);
        return parsedItem;
    }
    function formatReturnData(data) {
        obj = {'meta':data['meta'], 'items':[] }
        $.each(data, function(i,v) {
            if(i != 'meta') {
                v.id = i;
                obj['items'].push(v);
            }
        });
        return obj;
    }

    return {

        init: function(successCallback, errorCallback) {
            if(window.localStorage) {
                initialized = true;
                successCallback(null);
            } else {
                errorCallback('storage_api_not_supported', 'The web storage api is not supported');
            }
        },

        initList: function(type, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!localStorage.getItem(type)) {
                localStorage.setItem(type, JSON.stringify({'meta':{}}));
            }
            initializedObjectStores[type] = true;
            var storageItem = getStorageObject(type);
            successCallback(formatReturnData(storageItem));
        },

        removeList: function(type, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!localStorage.getItem(type)) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            var storageItem = getStorageObject(type);
            localStorage.removeItem(type);
            successCallback(formatReturnData(storageItem));
        },

        setMeta: function(type, obj, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            var storageItem = getStorageObject(type);
            $.extend(storageItem['meta'], obj);
            localStorage.setItem(type, JSON.stringify(storageItem));
            successCallback(formatReturnData(storageItem));
        },

        addUnit: function(type, obj, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            var id = $.now();
            var storageItem = getStorageObject(type);
            storageItem[id] = obj;
            localStorage.setItem(type, JSON.stringify(storageItem));
            successCallback(formatReturnData(storageItem));
        },
        
        getList: function(type, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            var storageItem = getStorageObject(type);
            successCallback(formatReturnData(storageItem));
        },

        removeUnit: function(type, id, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            var storageItem = getStorageObject(type);
            if(storageItem[id]) {
                delete storageItem[id];
                localStorage.setItem(type, JSON.stringify(storageItem));
                successCallback(formatReturnData(storageItem));
            } else {
                errorCallback('object_not_found', 'The object requested could not be found');
            }
        },

        findAllLists: function(successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            }
            successCallback(Object.keys(localStorage));
        }
    }
}();

