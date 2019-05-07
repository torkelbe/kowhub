#!/usr/bin/python
'''
Parser for Kings of War army and rules data in CSV format.
Generates a JSON representation of the same army lists and rules.
'''
import sys
import json
from os import listdir, path

import jsongenerator
import keychecker
from utilities import data_location, error_logger


def generate_json_data():
    data = {
        "special": jsongenerator.parse_special(),
        "items": jsongenerator.parse_items(),
        "ranged": jsongenerator.parse_ranged(),
        "armies": jsongenerator.parse_armies()
    }
    if not data.get("special"): error_logger.critical("Rules for 'special' is missing")
    if not data.get("items"): error_logger.critical("Rules for 'items' is missing")
    if not data.get("ranged"): error_logger.critical("Rules for 'ranged' is missing")
    if not data.get("armies"): error_logger.critical("Rules for 'armies' is missing")

    jsongenerator.format_unit_rules(data)

    keychecker.check_key_collisions(data["special"], data["items"], data["ranged"])
    try:
        with open(data_location.json, 'r') as previous_data_file:
            previous_data = json.loads(previous_data_file.read())
            keychecker.check_key_consistency(data, previous_data)
    except IOError:
        error_logger.critical("Cannot find previous json file for key consistency check")

    return data


# === External interface ===
def export(write_to_file=False, write_to_console=False):

    if not (path.isdir(data_location.csv.armies) and path.isdir(data_location.csv.rules)):
        error_logger.critical("Cannot find directory for CSV source files", "Aborting 'csv-to-json'")
        return

    data = generate_json_data()

    if write_to_file:
        with open(data_location.json, 'w') as output_file:
            output_file.write(json.dumps(data, separators=(',',':')))
        error_logger.message("Data updated successfully")

    if write_to_console:
        sys.stdout.write(json.dumps(data, sort_keys=True, indent=4, separators=(',',':')))

    if not write_to_file and not write_to_console:
        error_logger.message("Parsing complete, no output written")

# === Main ===
if __name__ == "__main__":
    export(write_to_file=False, write_to_console=True)

