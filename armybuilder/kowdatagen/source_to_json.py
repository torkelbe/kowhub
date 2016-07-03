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

def get_rule_elements(name):
    parts = name.split('(')
    name = parts[0].strip()
    value = parts[1].split(')')[0] if len(parts)>1 else ""
    return name, value

# === Parser ===
class CsvParser:

    def __init__(self, base_dir, error_print=False):
        self.error_print = error_print
        self.separator = ';' # separator character in the CSV
        self.rules_dir = path.join(base_dir, "sources/rules_data")
        self.army_dir = path.join(base_dir, "sources/army_data")

    def parse(self):
        self.special = self.parse_special_rules()
        self.items = self.parse_magic_items()
        self.ranged = self.parse_ranged()
        self.armies = self.parse_all_armies()
        self.format_unit_special_rules()
        return {'special':self.special, 'items':self.items, 'ranged':self.ranged, 'armies':self.armies}

    def parse_special_rules(self):
        special = {}
        for filename in listdir(self.rules_dir):
            if "special" in filename and filename.endswith('.csv'):
                with open(path.join(self.rules_dir, filename), 'r') as file:
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
        for filename in listdir(self.rules_dir):
            if "items" in filename and filename.endswith('.csv'):
                with open(path.join(self.rules_dir, filename), 'r') as file:
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
        for filename in listdir(self.rules_dir):
            if "ranged" in filename and filename.endswith('.csv'):
                with open(path.join(self.rules_dir, filename), 'r') as file:
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
        for filename in listdir(self.army_dir):
            if filename.endswith('.csv'):
                with open(path.join(self.army_dir, filename), 'r') as file:
                    key, obj = self.parse_army(file)
                    armies[key] = obj
        return armies

    def parse_army(self, file):
        army = {}
        file.readline() # throw first line
        #--- Army Header ---
        line = file.readline()
        entry, armyname, alignment, armynamekey = properties(line, self.separator)[:4]
        army["name"] = armyname
        army["alignment"] = alignment
        #--- Units ---
        army["units"] = {}
        line = file.readline()
        counter = 1
        while line:
            entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(line, self.separator)
            unit, line = self.parse_unit(line, file)
            army["units"][counter] = unit
            counter += 1
        return armynamekey, army

    def parse_unit(self, line, file):
        unit = {}
        entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(line, self.separator)
        unit["name"] = name
        unit["type"] = typ
        unit["special"] = special
        name=""
        new_line = ""
        if not size:
            if entry=="hero":
                unit["Hero"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            elif typ=="Monster":
                unit["Monster"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            elif typ=="War Engine":
                unit["Warengine"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            return unit, file.readline()
        if size=="Troop":
            unit["Troop"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            new_line = file.readline()
            entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line, self.separator)
        if size=="Regiment" and not name:
            unit["Regiment"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            new_line = file.readline()
            entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line, self.separator)
        if size=="Horde" and not name:
            unit["Horde"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
            new_line = file.readline()
            entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line, self.separator)
        if size=="Legion" and not name:
            unit["Legion"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
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
                            print >>sys.stderr, "Unrecognized special rule:  "+name
                        specialkey_list.append(rule)
                unit["special"] = specialkey_list
                unit["ranged"] = rangedkey_list

# === External interface ===
def generate_data(error_print=False, write_to_file=True):
    base_dir = path.dirname(path.abspath(__file__))
    data_parser = CsvParser(base_dir, error_print)
    data_obj = data_parser.parse()
    if(write_to_file):
        filename = path.join(base_dir, "../data/kowdata.json")
        with open(filename, 'w') as output_file:
            output_file.write(json.dumps(data_obj, separators=(',',':')))
    else:
        sys.stdout.write(json.dumps(data_obj, separators=(',',':')))

# === Main ===
if __name__ == "__main__":
    generate_data(error_print=True, write_to_file=False)
