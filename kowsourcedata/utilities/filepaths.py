#!/usr/bin/python
'''
Class for reading file paths of KoW source data.
'''
from os import mkdir
from os.path import abspath, dirname, isdir, join


class PathToSourceData:
    def __init__(self):
        package_dir = dirname(dirname(abspath(__file__)))
        project_root = dirname(package_dir)

        spreadsheet_dir = join(dirname(project_root), 'kowsources')
        csv_dir = join(package_dir, 'temp')
        json_dir = join(package_dir, 'output')
        jslib_dir = join(project_root, 'frontend/src/lib/temp')

        self.numbers = _PathSet(join(spreadsheet_dir, 'army_data.numbers'),
                                join(spreadsheet_dir, 'rules_data.numbers'))

        if not isdir(csv_dir): mkdir(csv_dir)
        self.csv = _PathSet(join(csv_dir, 'armies'),
                            join(csv_dir, 'rules'))

        if not isdir(json_dir): mkdir(json_dir)
        self.json = join(json_dir, 'kowdata.json')

        if not isdir(jslib_dir): mkdir(jslib_dir)
        self.js = join(jslib_dir, 'source-data.js')


class _PathSet:
    def __init__(self, armies_location, rules_location):
        self.armies = armies_location
        self.rules = rules_location


data_location = PathToSourceData()

