#!/usr/bin/python
from kowsourcedata.utilities import error_logger

def _get_data_keys(dataobj):
    return_obj = {}
    for key, data in dataobj.iteritems():
        # Remove non-ascii (apostrophes) from names; python does not handle them well
        return_obj[key] = ''.join([i if ord(i)<128 else '' for i in data.get("name")])
    return return_obj

def check_key_collisions(special_data, items_data, ranged_data):
    special = _get_data_keys(special_data)
    items = _get_data_keys(items_data)
    ranged = _get_data_keys(ranged_data)
    for key in special.iterkeys():
        if key in items:
            error_logger.critical("Shared special and items keys", special.get(key), items.get(key))
        if key in ranged:
            error_logger.critical("Shared special and ranged keys", special.get(key), ranged.get(key))
    for key in items.iterkeys():
        if key in ranged:
            error_logger.critical("Shared item and ranged keys", items.get(key), ranged.get(key))
    error_logger.message("Key collision check completed")

def check_key_consistency(newobj, oldobj):
    #--- check army keys ---#
    newarmies = _get_data_keys(newobj.get("armies"))
    oldarmies = _get_data_keys(oldobj.get("armies"))
    for armykey, armyname in oldarmies.iteritems():
        if not newarmies.has_key(armykey):
            error_logger.critical("New data will lose army key", armykey, armyname)
            continue
        elif armyname != newarmies.get(armykey):
            error_logger.critical("Army '"+armykey+"' changes name", armyname, newarmies.get(armykey))
        #--- check unit keys ---#
        newunits = _get_data_keys(newobj.get("armies").get(armykey).get("units"))
        oldunits = _get_data_keys(oldobj.get("armies").get(armykey).get("units"))
        for unitkey, unitname in oldunits.iteritems():
            if not newunits.has_key(unitkey):
                error_logger.critical("New data will lose unit key", unitkey, unitname)
            elif unitname != newunits.get(unitkey):
                error_logger.critical("Unit '"+unitkey+"' changes name", unitname, newunits.get(unitkey))

    #--- check special keys ---#
    newrules = _get_data_keys(newobj.get("special"))
    oldrules = _get_data_keys(oldobj.get("special"))
    for ruleskey, rulesname in oldrules.iteritems():
        if not newrules.has_key(ruleskey):
            error_logger.critical("New data will lose special key", ruleskey, rulesname)
        elif rulesname != newrules.get(ruleskey):
            error_logger.critical("Special rule '"+ruleskey+"' changes name", rulesname, newrules.get(ruleskey))

    #--- check item keys ---#
    newitems = _get_data_keys(newobj.get("items"))
    olditems = _get_data_keys(oldobj.get("items"))
    for itemkey, itemname in olditems.iteritems():
        if not newitems.has_key(itemkey):
            error_logger.critical("New data will lose item key", itemkey, itemname)
        elif itemname != newitems.get(itemkey):
            error_logger.critical("Item '"+itemkey+"' changes name", itemname, newitems.get(itemkey))

    #--- check ranged keys ---#
    newranged = _get_data_keys(newobj.get("ranged"))
    oldranged = _get_data_keys(oldobj.get("ranged"))
    for rangedkey, rangedname in oldranged.iteritems():
        if not newranged.has_key(rangedkey):
            error_logger.critical("New data will lose ranged key", rangedkey, rangedname)
        elif rangedname != newranged.get(rangedkey):
            error_logger.critical("Ranged attack '"+rangedkey+"' changes name", rangedname, newranged.get(rangedkey))
    error_logger.message("Key consistency check completed")

