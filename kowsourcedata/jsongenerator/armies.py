#!/usr/bin/python
from os import listdir, path

from kowsourcedata.utilities import data_location, error_logger, csvutils


class ArmyParser:

    def parse_all_armies(self):
        armies = {}
        army_order_list = []
        for filename in listdir(data_location.csv.armies):
            if filename.endswith('.csv'):
                with open(path.join(data_location.csv.armies, filename), 'r') as file:
                    armykey, army = self.parse_army(file)
                    if len(armykey) != 2:
                        error_logger.critical("Non-standard length(2) of army key", armykey, army.get("name"))
                    if not armykey in armies:
                        armies[armykey] = army
                    else:
                        error_logger.critical("Duplicate army key", armies.get(armykey).get("name"), army.get("name"))
                    if army["order"] in army_order_list:
                        error_logger.warning("Duplicate army ordering", army.get("name"))
                    army_order_list.append(army["order"])
        return armies

    def parse_army(self, file):
        army = {}
        file.readline() # throw first line
        #--- Army Header ---#
        line = file.readline()
        entry, order, armykey, armyname, short_armyname, alignment, version, status = csvutils.read_army(line)
        version = ""    # To what ruleset does this item belong. Not yet used.
        status = ""     # Current status of the rules for this item. Not yet used.
        army["name"] = armyname
        army["sname"] = short_armyname
        army["alignment"] = alignment
        army["order"] = int(order)
        #--- Units ---#
        army["units"] = {}
        line = file.readline()
        unit_order = 1
        while line:
            entry, order, key, name, short_name, typ, size, stats, special, options, version, status = csvutils.read_unit(line)
            unit, line = self.parse_unit(line, file)
            key = armykey + key
            if len(key) != 4:
                error_logger.critical("Non-standard length(4) of unit key", key, unit.get("name"))
            if not key in army["units"]:
                unit["order"] = unit_order
                unit["key"] = key
                army["units"][key] = unit
                unit_order += 1
            else:
                error_logger.critical("Duplicate unit key", army["units"].get(key).get("name"), name)
        return armykey, army

    def parse_unit(self, line, file):
        unit = {}
        entry, order, key, name, short_name, typ, size, stats, special, options, version, status = csvutils.read_unit(line)
        version = ""   # To what ruleset does this item belong. Not yet used.
        status = ""    # Current status of the rules for this item. Not yet used.
        unit["name"] = name
        unit["sname"] = short_name
        unit["type"] = typ
        unit["special"] = special
        name = ""
        new_line = ""
        if not size:
            if entry=="hero":
                unit["x"] = stats
            elif typ=="Monster":
                unit["m"] = stats
            elif typ=="War Engine":
                unit["e"] = stats
            else:
                error_logger.warning("Encountered incorrect unit format", unit.get("name"))
            return unit, file.readline()
        if size=="Troop":
            unit["t"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short_name, typ, size, stats, special, options, version, status = csvutils.read_unit(new_line)
        if size=="Regiment" and not name:
            unit["r"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short_name, typ, size, stats, special, options, version, status = csvutils.read_unit(new_line)
        if size=="Horde" and not name:
            unit["h"] = stats
            new_line = file.readline()
            if not new_line: return unit, new_line
            entry, order, key, name, short_name, typ, size, stats, special, options, version, status = csvutils.read_unit(new_line)
        if size=="Legion" and not name:
            unit["l"] = stats
            new_line = file.readline()
        return unit, new_line


def parse_armies():
    armyparser = ArmyParser()
    return armyparser.parse_all_armies()

