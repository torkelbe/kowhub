#!/usr/bin/python
from kowsourcedata.utilities import error_logger, csvutils

def format_unit_rules(data):

    specialobj = {}
    for key, ruleobj in data.get("special").iteritems():
        specialobj[ruleobj.get("name")] = key

    rangedobj = {}
    for key, itemobj in data.get("ranged").iteritems():
        rangedobj[itemobj.get("name")] = key
        rangedobj[itemobj.get("name")+"s"] = key

    for army in data.get("armies").itervalues():
        for unit in army.get("units").itervalues():
            rules = unit.get("special").split(',')
            if len(rules[0]) < 1: continue
            specialkey_list = []
            rangedkey_list = []
            for rule in rules:
                name, value = csvutils.get_special_rule_components(rule)
                selector = ""
                if ':' in name:
                    if name.startswith("Troop"): selector = "#t"
                    elif name.startswith("Regiment"): selector = "#r"
                    elif name.startswith("Horde"): selector = "#h"
                    elif name.startswith("Legion"): selector = "#l"
                    else: error_logger.warning("Unrecognized selector", name)
                    name = name.split(':')[1].strip()
                if name in specialobj:
                    key = selector + specialobj[name]
                    if value: specialkey_list.append(str(key)+':'+str(value))
                    else: specialkey_list.append(str(key))
                elif name in rangedobj:
                    key = rangedobj[name]
                    if value: rangedkey_list.append(str(key)+':'+str(value))
                    else: rangedkey_list.append(str(key))
                elif name.startswith("Base Size"):
                    base_size = name.split(" ")[-1]
                    unit["type"] += " (" + base_size + ")"
                else:
                    error_logger.warning("Unrecognized special rule", name)
                    specialkey_list.append(rule)
            unit["special"] = specialkey_list
            unit["ranged"] = rangedkey_list

