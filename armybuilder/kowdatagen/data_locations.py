#!/usr/bin/python
'''
Class for reading locations of data files.
'''
import os

class DataLocations:
    def __init__(self):
        base_dir = os.path.dirname(os.path.realpath(__file__))
        self.numbers = _DLType(base_dir+"/../../../kowsources/army_data.numbers", base_dir+"/../../../kowsources/rules_data.numbers")
        if not os.path.isdir(base_dir+"/csv"): os.mkdir(base_dir+"/csv")
        self.csv = _DLType(base_dir+"/csv/armies", base_dir+"/csv/rules")
        if not os.path.isdir(base_dir+"/../data"): os.mkdir(base_dir+"/../data")
        self.json = base_dir+"/../data/kowdata.json"

class _DLType:
    def __init__(self, armies_location, rules_location):
        self.armies = armies_location
        self.rules = rules_location
