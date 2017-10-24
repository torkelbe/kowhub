#!/usr/bin/python
from os import listdir, path

from kowsourcedata.utilities import data_location, error_logger, csvutils

def parse_items():
    items = {}
    for filename in listdir(data_location.csv.rules):
        if "items" in filename and filename.endswith('.csv'):
            with open(path.join(data_location.csv.rules, filename), 'r') as file:
                file.readline() # throw first line
                line = file.readline()
                while line:
                    name, key, pts, modifier, limitation, version, status, description = csvutils.get_elements(line);
                    modifier = ""       # How the item modifies unit profile. Not yet used.
                    limitation = ""     # Limitation on who can choose the item. Not yet used.
                    version = ""        # To what ruleset does this item belong. Not yet used.
                    status = ""         # Current status of the rules for this item. Not yet used.
                    description = ""    # Rulebook description of this item

                    if len(key) != 3:
                        error_logger.critical("Non-standard length(3) of item key", key, name)
                    if not key in items:
                        items[key] = {
                            "name": name,
                            "pts": int(pts),
                            "mod": modifier,
                            "lim": limitation,
                        }
                    else:
                        error_logger.critical("Duplicate item key", items.get(key).get("name"), name)
                    line = file.readline()
                break
    return items

