#!/usr/bin/python
'''
Export Kowhub's Kings of War source data to front-end library as
a .js file to be imported and included by Webpack.
'''
import json

from utilities import data_location

JS_TEMPLATE = """
const data = ?SOURCES?
export default data;
"""


class jsSourceGenerator:

    def __init__(self, dataObj):
        self.data = dataObj

    def export(self):
        return JS_TEMPLATE.replace("?SOURCES?", json.dumps(self.data))


def export():
    with open(data_location.json) as data_file:
        js_generator = jsSourceGenerator(json.load(data_file))
    with open(data_location.js, 'w') as output_file:
        output_file.write(js_generator.export())

# === Main ===
if __name__ == "__main__":
    export()
