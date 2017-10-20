#!/usr/bin/python
'''
Conversion tool for Kowhub's Kings of War source data.
Reads source data in JSON format, and creates a corresponding .js
file that may be imported by front-end modules, and may be included
in front-end bundles by Webpack.
'''
import json
import data_locations

JS_TEMPLATE = """
const data = ?SOURCES?
export default data;
"""


class jsSourceGenerator:

    def __init__(self, dataObj):
        self.data = dataObj

    def export(self):
        return JS_TEMPLATE.replace("?SOURCES?", json.dumps(self.data))


def export_js():
    locations = data_locations.DataLocations()
    with open(locations.json) as data_file:
        js_generator = jsSourceGenerator(json.load(data_file))
    with open(locations.js, 'w') as output_file:
        output_file.write(js_generator.export())

# === Main ===
if __name__ == "__main__":
    export_js()
