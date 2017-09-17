#!/usr/bin/python
#Author: Torkel Berli (torkelbe@gmail.com)
'''
Parser for Kings of War army and rules data in CSV format.
Prints to stdout a JSON representation of the same army lists and rules.
Note: format of CSV input and JSON output does not adhere to any formal standard.
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

def properties(line, separator):
    elements =  line.rstrip('\r\n').split(separator)
    for e in elements:
        e = e.strip()
    return elements

def split_line(line, separator):
    entry, order, key, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(line, separator)
    stats = get_stats_obj(sp, me, ra, de, att, ne, pts)
    return entry, order, key, name, typ, size, stats, special, options

def get_rule_elements(name):
    parts = name.split('(')
    name = parts[0].strip()
    value = parts[1].split(')')[0] if len(parts)>1 else ""
    return name, value

# === Parser ===
class CsvParser:

    def __init__(self, file_location, error_print=False):
        self.error_print = error_print
        self.separator = ';' # separator character in the CSV
        self.csv = file_location

    def parse(self):
        self.special = self.parse_special_rules()
        self.items = self.parse_magic_items()
        self.ranged = self.parse_ranged()
        self.armies = self.parse_all_armies()
        self.format_unit_special_rules()
        return {'special':self.special, 'items':self.items, 'ranged':self.ranged, 'armies':self.armies}

    def parse_special_rules(self):
        special = {}
        for filename in listdir(self.csv.rules):
            if "special" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    counter = 1
                    line = file.readline()
                    while line:
                        name, description = properties(line, self.separator);
                        name, value = get_rule_elements(name)
                        special[counter] = name
                        counter += 1
                        line = file.readline()
                    break
        return special

    def parse_magic_items(self):
        items = {}
        for filename in listdir(self.csv.rules):
            if "items" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    counter = 1
                    line = file.readline()
                    while line:
                        name, pts, action, description, limitation = properties(line, self.separator);
                        action = "" # Action not yet used
                        limitation = "" # Limitation not yet used
                        items[counter] = {}
                        items[counter]["n"] = name
                        items[counter]["p"] = int(pts)
                        items[counter]["a"] = action
                        items[counter]["l"] = limitation
                        counter += 1
                        line = file.readline()
                    break
        return items

    def parse_ranged(self):
        ranged = {}
        for filename in listdir(self.csv.rules):
            if "ranged" in filename and filename.endswith('.csv'):
                with open(path.join(self.csv.rules, filename), 'r') as file:
                    file.readline() # throw first line
                    counter = 1
                    line = file.readline()
                    while line:
                        name, reach, description = properties(line, self.separator);
                        ranged[counter] = {}
                        ranged[counter]["n"] = name
                        ranged[counter]["r"] = reach
                        counter += 1
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
                    if not key in armies:
                        armies[key] = obj
                    elif(self.error_print):
                        print >>sys.stdout, "Duplicate army key:  "+key+" ("+filename+")"
                    if obj["order"] in army_order_list and (self.error_print):
                        print >>sys.stdout, "Duplicate army ordering:  "+filename
                    army_order_list.append(obj["order"])
        return armies

    def parse_army(self, file):
        army = {}
        file.readline() # throw first line
        #--- Army Header ---
        line = file.readline()
        entry, order, armykey, armyname, alignment = properties(line, self.separator)[:5]
        army["name"] = armyname
        army["alignment"] = alignment
        army["order"] = int(order)
        #--- Units ---
        army["units"] = {}
        line = file.readline()
        unit_order_list = []
        while line:
            entry, order, key, name, typ, size, stats, special, options = split_line(line, self.separator)
            unit, line = self.parse_unit(line, file)
            key = armykey + key
            if not key in army["units"]:
                army["units"][key] = unit
            elif (self.error_print):
                print >>sys.stdout, "Duplicate unit key:  "+key+" ("+name+")"
            if unit["order"] in unit_order_list and (self.error_print):
                print >>sys.stdout, "Duplicate unit ordering:  "+name
            unit_order_list.append(unit["order"])
        return armykey, army

    def parse_unit(self, line, file):
        unit = {}
        entry, order, key, name, typ, size, stats, special, options = split_line(line, self.separator)
        unit["name"] = name
        unit["type"] = typ
        unit["order"] = int(order)
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
            return unit, file.readline()
        if size=="Troop":
            unit["Troop"] = stats
            new_line = file.readline()
            entry, order, key, name, typ, size, stats, special, options = split_line(new_line, self.separator)
        if size=="Regiment" and not name:
            unit["Regiment"] = stats
            new_line = file.readline()
            entry, order, key, name, typ, size, stats, special, options = split_line(new_line, self.separator)
        if size=="Horde" and not name:
            unit["Horde"] = stats
            new_line = file.readline()
            entry, order, key, name, typ, size, stats, special, options = split_line(new_line, self.separator)
        if size=="Legion" and not name:
            unit["Legion"] = stats
            new_line = file.readline()
        return unit, new_line

    def format_unit_special_rules(self):
        specialObj = {}
        rangedObj = {}
        for key, name in self.special.items():
            specialObj[name] = key
        for key, item in self.ranged.items():
            rangedObj[item["n"]] = key
        for army in self.armies.itervalues():
            for unit in army["units"].itervalues():
                rules = unit["special"].split(',')
                if len(rules[0]) < 1: continue
                specialkey_list = []
                rangedkey_list = []
                for rule in rules:
                    name, value = get_rule_elements(rule)
                    if name in specialObj:
                        key = specialObj[name]
                        if value: specialkey_list.append(str(key)+':'+str(value))
                        else: specialkey_list.append(str(key))
                    elif name in rangedObj:
                        key = rangedObj[name]
                        if value: rangedkey_list.append(str(key)+':'+str(value))
                        else: rangedkey_list.append(str(key))
                    else:
                        if(self.error_print):
                            print >>sys.stdout, "Unrecognized special rule:  "+name
                        specialkey_list.append(rule)
                unit["special"] = specialkey_list
                unit["ranged"] = rangedkey_list

# === Key conformity check ===
def _check_key_conformity(newobj, oldobj_filename):
    try:
        with open(oldobj_filename, 'r') as oldobj_file:
            oldobj = json.loads(oldobj_file.read())
        newkeys = _get_keys_obj(newobj)
        oldkeys = _get_keys_obj(oldobj)
        for armykey, army in oldkeys.iteritems():
            if not newkeys.has_key(armykey):
                _confirmation_warning("Updated data will lose army key: "+armykey)
            for unitkey, unitname in army.iteritems():
                if newkeys[armykey].has_key(unitkey):
                    newname = newkeys[armykey][unitkey]
                    if not unitname == newname:
                        _confirmation_warning("Name for key '"+unitkey+"' will change from '"+unitname+"' to '"+newname+"'")
                else:
                    _confirmation_warning("Updated data will lose unit key '"+unitkey+"' : '"+unitname+"'")
        print >>sys.stderr, "Key conformity check completed"
    except IOError as e:
        print >>sys.stderr, "Key conformity check FAILED. Could not read previous data file."

def _get_keys_obj(dataobj):
    obj = {}
    for armykey, armydata in dataobj["armies"].iteritems():
        armyobj = {}
        for key, unit in armydata["units"].iteritems():
            # Remove non-ascii (apostrophes) from names; python does not handle them well
            armyobj[key] = ''.join([i if ord(i)<128 else '' for i in unit["name"]])
        obj[armykey] = armyobj
    return obj

def _confirmation_warning(message):
    print >>sys.stderr, "DATA KEY WARNING!"
    print >>sys.stderr, message
    print >>sys.stderr, "Continue (yes/no)? ",
    response = raw_input()
    if not response == "yes":
        print >>sys.stderr, "Aborted. Data files have not been updated"
        exit(1)

# === External interface ===
def generate_data(error_print=False, write_to_file=False, write_to_console=False, check_keys=True):
    files = data_locations.DataLocations()
    data_parser = CsvParser(files.csv, error_print)
    data_obj = data_parser.parse()
    if check_keys:
        _check_key_conformity(data_obj, files.json)
    if write_to_file:
        with open(files.json, 'w') as output_file:
            output_file.write(json.dumps(data_obj, separators=(',',':')))
        print >>sys.stderr, "Data updated successfully"
    if write_to_console:
        sys.stdout.write(json.dumps(data_obj, separators=(',',':')))

# === Main ===
if __name__ == "__main__":
    generate_data(error_print=True, write_to_file=False, write_to_console=True)
