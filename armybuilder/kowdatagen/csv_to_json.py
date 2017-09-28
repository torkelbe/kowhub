#!/usr/bin/python
#Author: Torkel Berli (torkelbe@gmail.com)
'''
Parser for Kings of War army and rules data in CSV format.
Prints to stdout a JSON representation of the same army lists and rules.
'''
import sys
import json
from os import listdir, path
import data_locations

# === Helper functions ===
def get_stats_obj(sp, me, ra, de, att, ne, pts):
    me = me if me=='-' else me+'+'
    ra = ra if ra=='-' else ra+'+'
    de = de+'+'
    return [sp, me, ra, de, att, ne, int(pts)]

def get_elements(line, separator):
    elements =  line.rstrip('\r\n').split(separator)
    for e in elements:
        e = e.strip()
    return elements

def read_army(line, separator):
    entry, order, armykey, armyname, armyname_short, alignment, size, sp, me, ra, de, att, ne, pts, special, options, version, status = get_elements(line, separator)
    if entry != "army":
        print >>sys.stderr, "Error. Tried to read army properties of a non-army line:"
        print >>sys.stderr, line
    return entry, order, armykey, armyname, armyname_short, alignment, version, status

def read_unit(line, separator):
    entry, order, key, name, short, typ, size, sp, me, ra, de, att, ne, pts, special, options, version, status = get_elements(line, separator)
    stats = get_stats_obj(sp, me, ra, de, att, ne, pts)
    return entry, order, key, name, short, typ, size, stats, special, options, version, status

def get_rule_elements(name):
    parts = name.split('(')
    name = parts[0].strip()
    value = parts[1].split(')')[0] if len(parts)>1 else ""
    return name, value

# === Parser ===
class CsvParser:

    def __init__(self, file_location):
        self.separator = ';' # separator character in the CSV
        self.csv = file_location

    def parse(self):
        self.special = self.parse_special_rules()
        self.items = self.parse_magic_items()
        self.ranged = self.parse_ranged()
        self.armies = self.parse_all_armies()
        self.inspect_key_collisions()
        self.format_unit_special_rules()
        return {'special':self.special, 'items':self.items, 'ranged':self.ranged, 'armies':self.armies}

    def parse_special_rules(self):
        special = {}
        for filename in listdir(self.csv.rules):
            if "special" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    line = file.readline()
                    while line:
                        name, key, version, status, description = get_elements(line, self.separator);
                        version = "" # To what ruleset does this special rule belong. Not yet used.
                        status = "" # Current status of the rules for this item. Not yet used.
                        description = "" # Rulebook description of this item
                        if len(key) != 3:
                            self.print_warning("Non-standard length(3) of special rule key", key, name)
                        if not key in special:
                            special[key] = {"name":name}
                        else:
                            self.print_warning("Duplicate special key", special.get(key).get("name"), name)
                        line = file.readline()
                    break
        return special

    def parse_magic_items(self):
        items = {}
        for filename in listdir(self.csv.rules):
            if "items" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    line = file.readline()
                    while line:
                        name, key, pts, modifier, limitation, version, status, description = get_elements(line, self.separator);
                        modifier = "" # How the item modifies unit profile. Not yet used.
                        limitation = "" # Limitation on who can choose the item. Not yet used.
                        version = "" # To what ruleset does this item belong. Not yet used.
                        status = "" # Current status of the rules for this item. Not yet used.
                        description = "" # Rulebook description of this item
                        if len(key) != 3:
                            self.print_warning("Non-standard length(3) of item key", key, name)
                        if not key in items:
                            items[key] = {"name":name, "pts":int(pts), "mod":modifier, "lim":limitation}
                        else:
                            self.print_warning("Duplicate item key", items.get(key).get("name"), name)
                        line = file.readline()
                    break
        return items

    def parse_ranged(self):
        ranged = {}
        for filename in listdir(self.csv.rules):
            if "ranged" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    line = file.readline()
                    while line:
                        name, key, pts, rang, version, status, description = get_elements(line, self.separator);
                        pts = "" # Cost of general purchase, if applicable. Not yet used.
                        version = "" # To what ruleset does this item belong. Not yet used.
                        status = "" # Current status of the rules for this item. Not yet used.
                        description = "" # Rulebook description of this item
                        if len(key) != 3:
                            self.print_warning("Non-standard length(3) of ranged key", key, name)
                        if not key in ranged:
                            ranged[key] = {"name":name, "range":rang}
                        else:
                            self.print_warning("Duplicate ranged key", ranged.get(key).get("name"), name)
                        line = file.readline()
                    break
        return ranged

    def parse_all_armies(self):
        armies = {}
        army_order_list = []
        for filename in listdir(self.csv.armies):
            if filename.endswith('.csv'):
                with open(path.join(self.csv.armies, filename), 'r') as file:
                    key, obj = self.parse_army(file)
                    if len(key) != 2:
                        self.print_warning("Non-standard length(2) of army key", key, obj.get("name"))
                    if not key in armies:
                        armies[key] = obj
                    else:
                        self.print_warning("Duplicate army key", armies.get(key).get("name"), obj.get("name"))
                    if obj["order"] in army_order_list:
                        self.print_error("Duplicate army ordering", obj.get("name"))
                    army_order_list.append(obj["order"])
        return armies

    def parse_army(self, file):
        army = {}
        file.readline() # throw first line
        #--- Army Header ---
        line = file.readline()
        entry, order, armykey, armyname, armyname_short, alignment, version, status = read_army(line, self.separator)
        version = "" # To what ruleset does this item belong. Not yet used.
        status = "" # Current status of the rules for this item. Not yet used.
        army["name"] = armyname
        army["short"] = armyname_short
        army["alignment"] = alignment
        army["order"] = int(order)
        #--- Units ---
        army["units"] = {}
        line = file.readline()
        unit_order = 1
        while line:
            entry, order, key, name, short, typ, size, stats, special, options, version, status = read_unit(line, self.separator)
            unit, line = self.parse_unit(line, file)
            key = armykey + key
            if len(key) != 4:
                self.print_warning("Non-standard length(4) of unit key", key, unit.get("name"))
            if not key in army["units"]:
                unit["order"] = unit_order
                army["units"][key] = unit
                unit_order += 1
            else:
                self.print_warning("Duplicate unit key", army["units"].get(key).get("name"), name)
        return armykey, army

    def parse_unit(self, line, file):
        unit = {}
        entry, order, key, name, short, typ, size, stats, special, options, version, status = read_unit(line, self.separator)
        version = "" # To what ruleset does this item belong. Not yet used.
        status = "" # Current status of the rules for this item. Not yet used.
        unit["name"] = name
        unit["short"] = short
        unit["type"] = typ
        unit["special"] = special
        name=""
        new_line = ""
        if not size:
            if entry=="hero":
                unit["Hero"] = stats
            elif typ=="Monster":
                unit["Monster"] = stats
            elif typ=="War Engine":
                unit["Warengine"] = stats
            else:
                self.print_error("Encountered incorrect unit format", unit.get("name"))
            return unit, file.readline()
        if size=="Troop":
            unit["Troop"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short, typ, size, stats, special, options, version, status = read_unit(new_line, self.separator)
        if size=="Regiment" and not name:
            unit["Regiment"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short, typ, size, stats, special, options, version, status = read_unit(new_line, self.separator)
        if size=="Horde" and not name:
            unit["Horde"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short, typ, size, stats, special, options, version, status = read_unit(new_line, self.separator)
        if size=="Legion" and not name:
            unit["Legion"] = stats
            new_line = file.readline()
        return unit, new_line

    def inspect_key_collisions(self):
        special = _get_data_keys(self.special)
        items = _get_data_keys(self.items)
        ranged = _get_data_keys(self.ranged)
        for key in special.iterkeys():
            if key in items:
                self.print_warning("Shared special and items keys", special.get(key), items.get(key))
            if key in ranged:
                self.print_warning("Shared special and ranged keys", special.get(key), ranged.get(key))
        for key in items.iterkeys():
            if key in ranged:
                self.print_warning("Shared item and ranged keys", items.get(key), ranged.get(key))

    def format_unit_special_rules(self):
        specialobj = {}
        rangedobj = {}
        for key, ruleobj in self.special.iteritems():
            specialobj[ruleobj.get("name")] = key
        for key, itemobj in self.ranged.iteritems():
            rangedobj[itemobj.get("name")] = key
            rangedobj[itemobj.get("name")+"s"] = key
        for army in self.armies.itervalues():
            for unit in army.get("units").itervalues():
                rules = unit.get("special").split(',')
                if len(rules[0]) < 1: continue
                specialkey_list = []
                rangedkey_list = []
                for rule in rules:
                    name, value = get_rule_elements(rule)
                    selector = ""
                    if ':' in name:
                        if name.startswith("Troop"): selector = "#t"
                        elif name.startswith("Regiment"): selector = "#r"
                        elif name.startswith("Horde"): selector = "#h"
                        elif name.startswith("Legion"): selector = "#l"
                        else: self.print_error("Unrecognized selector", name)
                        name = name.split(':')[1].strip()
                    if name in specialobj:
                        key = selector + specialobj[name]
                        if value: specialkey_list.append(str(key)+':'+str(value))
                        else: specialkey_list.append(str(key))
                    elif name in rangedobj:
                        key = rangedobj[name]
                        if value: rangedkey_list.append(str(key)+':'+str(value))
                        else: rangedkey_list.append(str(key))
                    else:
                        self.print_error("Unrecognized special rule", name)
                        specialkey_list.append(rule)
                unit["special"] = specialkey_list
                unit["ranged"] = rangedkey_list

    def print_error(self, message, item1="", item2=""):
        print >>sys.stderr, message + (":  '"+item1 if item1 else "") + ("' - '"+item2+"'" if item2 else "'")

    def print_warning(self, message, item1="", item2=""):
        self.print_error("WARNING! "+message, item1, item2)
        raw_input("(Press Enter to continue)")


# === Key consistency check ===
def _check_key_consistency(newobj, oldobj_filename):
    try:
        with open(oldobj_filename, 'r') as oldobj_file:
            oldobj = json.loads(oldobj_file.read())
        # check army keys
        newarmies = _get_data_keys(newobj.get("armies"))
        oldarmies = _get_data_keys(oldobj.get("armies"))
        for armykey, armyname in oldarmies.iteritems():
            if not newarmies.has_key(armykey):
                _confirmation_warning("New data will lose army key '"+armykey+"' ("+armyname+")")
                continue
            elif armyname != newarmies.get(armykey):
                _confirmation_warning("Army '"+armykey+"' changes name from "+armyname+" to "+newarmies.get(armykey))
            # check unit keys
            newunits = _get_data_keys(newobj.get("armies").get(armykey).get("units"))
            oldunits = _get_data_keys(oldobj.get("armies").get(armykey).get("units"))
            for unitkey, unitname in oldunits.iteritems():
                if not newunits.has_key(unitkey):
                    _confirmation_warning("New data will lose unit key '"+unitkey+"' ("+unitname+")")
                elif unitname != newunits.get(unitkey):
                    _confirmation_warning("Unit '"+unitkey+"' changes name from "+unitname+" to "+newunits.get(unitkey))
        # check special keys
        newrules = _get_data_keys(newobj.get("special"))
        oldrules = _get_data_keys(oldobj.get("special"))
        for ruleskey, rulesname in oldrules.iteritems():
            if not newrules.has_key(ruleskey):
                _confirmation_warning("New data will lose special key '"+ruleskey+"' ("+rulesname+")")
            elif rulesname != newrules.get(ruleskey):
                _confirmation_warning("Special rule '"+ruleskey+"' changes name from "+rulesname+" to "+newrules.get(ruleskey))
        # check item keys
        newitems = _get_data_keys(newobj.get("items"))
        olditems = _get_data_keys(oldobj.get("items"))
        for itemkey, itemname in olditems.iteritems():
            if not newitems.has_key(itemkey):
                _confirmation_warning("New data will lose item key '"+itemkey+"' ("+itemname+")")
            elif itemname != newitems.get(itemkey):
                _confirmation_warning("Item '"+itemkey+"' changes name from "+itemname+" to "+newitems.get(itemkey))
        # check ranged keys
        newranged = _get_data_keys(newobj.get("ranged"))
        oldranged = _get_data_keys(oldobj.get("ranged"))
        for rangedkey, rangedname in oldranged.iteritems():
            if not newranged.has_key(rangedkey):
                _confirmation_warning("New data will lose ranged key '"+rangedkey+"' ("+rangedname+")")
            elif rangedname != newranged.get(rangedkey):
                _confirmation_warning("Ranged attack '"+rangedkey+"' changes name from "+rangedname+" to "+newranged.get(rangedkey))
        print >>sys.stderr, "Key consistency check completed"
    except IOError as e:
        print >>sys.stderr, "Key consistency check failed. No previous data file."

def _get_data_keys(dataobj):
    obj = {}
    for key, data in dataobj.iteritems():
        # Remove non-ascii (apostrophes) from names; python does not handle them well
        obj[key] = ''.join([i if ord(i)<128 else '' for i in data.get("name")])
    return obj

def _confirmation_warning(message):
    print >>sys.stderr, "KEY CONSISTENCY WARNING!", message
    print >>sys.stderr, "Press Enter to continue, or type 'q' to abort.",
    response = raw_input()
    if response.startswith("q"):
        print >>sys.stderr, "Aborted. Data files have not been updated"
        exit(1)

# === External interface ===
def generate_data(write_to_file=False, write_to_console=False, check_keys=True):
    files = data_locations.DataLocations()
    if not (path.isdir(files.csv.armies) and path.isdir(files.csv.rules)):
        print "Could not generate json data. Directory for csv files is missing."
        return
    data_parser = CsvParser(files.csv)
    data_obj = data_parser.parse()
    if not data_obj["special"]: print "Error: Rules for 'special' missing."
    if not data_obj["items"]: print "Error: Rules for 'items' missing."
    if not data_obj["ranged"]: print "Error: Rules for 'ranged' missing."
    if not data_obj["armies"]: print "Error: Rules for 'armies' missing."
    if check_keys:
        _check_key_consistency(data_obj, files.json)
    if write_to_file:
        with open(files.json, 'w') as output_file:
            output_file.write(json.dumps(data_obj, separators=(',',':')))
        print >>sys.stderr, "Data updated successfully"
    if write_to_console:
        sys.stdout.write(json.dumps(data_obj, separators=(',',':')))

# === Main ===
if __name__ == "__main__":
    generate_data(write_to_file=False, write_to_console=True)
