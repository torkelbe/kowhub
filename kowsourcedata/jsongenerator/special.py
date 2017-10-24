#!/usr/bin/python
from os import listdir, path

from kowsourcedata.utilities import data_location, error_logger, csvutils

def parse_special():
    special = {}
    for filename in listdir(data_location.csv.rules):
        if "special" in filename and filename.endswith('.csv'):
            with open(path.join(data_location.csv.rules, filename), 'r') as file:
                file.readline() # throw first line
                line = file.readline()
                while line:
                    name, key, version, status, description = csvutils.get_elements(line);
                    version = "" # To what ruleset does this special rule belong. Not yet used.
                    status = "" # Current status of the rules for this item. Not yet used.
                    description = "" # Rulebook description of this item
                    if len(key) != 3:
                        error_logger.critical("Non-standard length(3) of special rule key", key, name)
                    if not key in special:
                        special[key] = {"name":name}
                    else:
                        error_logger.critical("Duplicate special key", special.get(key).get("name"), name)
                    line = file.readline()
                break
    return special

