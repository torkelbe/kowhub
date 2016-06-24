#!/usr/bin/python
#Author: Torkel Berli (torkelbe@gmail.com)
'''
Parser for Kings of War army and rules data in CSV format.
Prints to stdout a JSON representation of the same army lists and rules.
Note: format of CSV input and JSON output does not adhere to any formal standard.
'''
import sys
import json
from os import listdir

RULES_DIR = "./sources/rules_data/"
ARMY_DIR = "./sources/army_data/"
SEPARATOR_KEY = ';' # separator character in the CSV

# === Helper functions ===
def get_stats_obj(sp, me, ra, de, att, ne, pts):
    me = me if me=='-' else me+'+'
    ra = ra if ra=='-' else ra+'+'
    de = de+'+'
    return {"Sp":sp,"Me":me,"Ra":ra,"De":de,"Att":att,"Ne":ne,"Pts":int(pts)}

def properties(line):
    elements =  line.rstrip('\r\n').split(SEPARATOR_KEY)
    for e in elements:
        e = e.strip()
    return elements

def get_rule_elements(name):
    parts = name.split('(')
    name = parts[0].strip()
    value = parts[1].split(')')[0] if len(parts)>1 else ""
    return name, value

def get_name_key(name):
    return "".join(name.split()).replace('*','').replace('[1]','').lower()

def error(line, filename):
    print >>sys.stderr, "Format error when parsing "+filename+":"
    print >>sys.stderr, "    "+line

# === Parser ===
def parse():
    obj = {}
    obj["special"] = parse_special_rules()
    obj["items"] = parse_magic_items()
    obj["spells"] = parse_spells()
    obj["armies"] = parse_all_armies()
    sys.stdout.write(json.dumps(obj, separators=(',',':')))
    return

def parse_special_rules():
    special = {}
    for filename in listdir(RULES_DIR):
        if "special" in filename and filename.endswith('.csv'):
            with open(RULES_DIR+filename, 'r') as file:
                file.readline() # throw first line
                counter = 1
                line = file.readline()
                while line:
                    name, description = properties(line);
                    name, value = get_rule_elements(name)
                    description = "" # Description not yet used
                    special[counter] = {}
                    special[counter]["name"] = name
                    special[counter]["desc"] = description
                    if value: special[counter]["value"] = value
                    counter += 1
                    line = file.readline()
                break
    return special

def parse_magic_items():
    items = {}
    for filename in listdir(RULES_DIR):
        if "items" in filename and filename.endswith('.csv'):
            with open(RULES_DIR+filename, 'r') as file:
                file.readline() # throw first line
                counter = 1
                line = file.readline()
                while line:
                    name, pts, action, description, limitation = properties(line);
                    action = "" # Action not yet used
                    description = "" # Description not yet used
                    limitation = "" # Limitation not yet used
                    items[counter] = {}
                    items[counter]["name"] = name
                    items[counter]["pts"] = int(pts)
                    items[counter]["act"] = action
                    items[counter]["lim"] = limitation
                    items[counter]["desc"] = description
                    counter += 1
                    line = file.readline()
                break
    return items

def parse_spells():
    spells = {}
    for filename in listdir(RULES_DIR):
        if "spells" in filename and filename.endswith('.csv'):
            with open(RULES_DIR+filename, 'r') as file:
                file.readline() # throw first line
                counter = 1
                line = file.readline()
                while line:
                    name, rang, description = properties(line);
                    rang = rang[:2]
                    description = "" # Description not yet used
                    spells[counter] = {}
                    spells[counter]["name"] = name
                    spells[counter]["rang"] = rang
                    spells[counter]["desc"] = description
                    counter += 1
                    line = file.readline()
                break
    return spells

def parse_all_armies():
    armies = {}
    for filename in listdir(ARMY_DIR):
        if filename.endswith('.csv'):
            with open(ARMY_DIR+filename, 'r') as file:
                key, obj = parse_army(file)
                armies[key] = obj
    return armies

def parse_army(file):
    army = {}
    file.readline() # throw first line
    #--- Army Header ---
    line = file.readline()
    entry, armyname, alignment = properties(line)[:3]
    armynamekey = get_name_key(armyname)
    army["name"] = armyname
    army["alignment"] = alignment
    #--- Units ---
    army["units"] = {}
    line = file.readline()
    while line:
        entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(line)
        unitnamekey = get_name_key(name)
        if not unitnamekey:
            error(line, file.name)
            exit(1)
        unit, line = parse_unit(line, file)
        army["units"][unitnamekey] = unit
    return armynamekey, army

def parse_unit(line, file):
    unit = {}
    entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(line)
    unit["name"] = name
    unit["type"] = typ
    unit["hero"] = "true" if entry=="hero" else "false"
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
        entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line)
    if size=="Regiment" and not name:
        unit["Regiment"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
        new_line = file.readline()
        entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line)
    if size=="Horde" and not name:
        unit["Horde"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
        new_line = file.readline()
        entry, name, typ, size, sp, me, ra, de, att, ne, pts, special, options = properties(new_line)
    if size=="Legion" and not name:
        unit["Legion"] = get_stats_obj(sp, me, ra, de, att, ne, pts)
        new_line = file.readline()
    return unit, new_line

# === Main ===
if __name__ == "__main__":
    parse()
