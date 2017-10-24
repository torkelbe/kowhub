#!/usr/bin/python
from os import listdir, path

from kowsourcedata.utilities import data_location, error_logger, csvutils

def parse_ranged():
    ranged = {}
    for filename in listdir(data_location.csv.rules):
        if "ranged" in filename and filename.endswith('.csv'):
            with open(path.join(data_location.csv.rules, filename), 'r') as file:
                file.readline() # throw first line
                line = file.readline()
                while line:
                    name, key, pts, rang, version, status, description = csvutils.get_elements(line);
                    pts = ""         # Cost of general purchase, if applicable. Not yet used.
                    version = ""     # To what ruleset does this item belong. Not yet used.
                    status = ""      # Current status of the rules for this item. Not yet used.
                    description = "" # Rulebook description of this item

                    if len(key) != 3:
                        error_logger.critical("Non-standard length(3) of ranged key", key, name)
                    if not key in ranged:
                        ranged[key] = {
                            "name":name,
                            "range":rang
                        }
                    else:
                        error_logger.critical("Duplicate ranged key", ranged.get(key).get("name"), name)
                    line = file.readline()
                break
    return ranged
