
storageEngine = function() {
    var initialized = false;
    var initializedObjectStores = {};

    function getStorageObject(type) {
        var item = localStorage.getItem(type);
        var parsedItem = JSON.parse(item);
        return parsedItem;
    }
    function formatReturnData(data) {
        obj = {'meta':data['meta'], 'units':[] }
        $.each(data, function(i,v) {
            if(i != 'meta') {
                v.id = i;
                obj['units'].push(v);
            }
        });
        return obj;
    }

    return {

        init: function(successCallback, errorCallback) {
            if(window.localStorage) {
                initialized = true;
                $.each(Object.keys(localStorage), function(i,v) {
                    initializedObjectStores[v] = true;
                });
                successCallback(null);
            } else {
                errorCallback('storage_api_not_supported', 'The web storage api is not supported');
            }
        },

        initList: function(type, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                localStorage.setItem(type, JSON.stringify({'meta':{}}));
            }
            initializedObjectStores[type] = true;
            var storageItem = getStorageObject(type);
            successCallback(formatReturnData(storageItem));
        },

        removeList: function(type, successCallback, errorCallback) {
            if(!initialized) {
                errorCallback('storage_api_not_initialized', 'The storage engine has not been initialized');
            } else if(!initializedObjectStores[type]) {
                errorCallback('store_not_initialized', 'The object store '+type+' has not been initialized');
            }
            initializedObjectStores[type] = false;
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
            var allLists = {};
            $.each(localStorage, function(key, value) {
                allLists[key] = (JSON.parse(value)).meta;
            }, function() {
                errorCallback('storage_format_error', 'Could not parse storage items correctly');
            });
            successCallback(allLists);
        }
    }
}();
