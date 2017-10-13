#!/usr/bin/python
'''
Class for reading locations of data files.
'''
from os import mkdir
from os.path import abspath, dirname, isdir, join

class DataLocations:
    def __init__(self):
        base_dir = dirname(abspath(__file__))
        project_root = dirname(base_dir)

        source_dir = join(dirname(project_root), 'kowsources')
        csv_dir = join(base_dir, 'temp')
        json_dir = join(base_dir, 'output')

        self.numbers = _DLType(join(source_dir, 'army_data.numbers'),
                               join(source_dir, 'rules_data.numbers'))

        if not isdir(csv_dir): mkdir(csv_dir)
        self.csv = _DLType(join(csv_dir, 'armies'),
                           join(csv_dir, 'rules'))

        if not isdir(json_dir): mkdir(json_dir)
        self.json = join(json_dir, 'kowdata.json')

class _DLType:
    def __init__(self, armies_location, rules_location):
        self.armies = armies_location
        self.rules = rules_location
