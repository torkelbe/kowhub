#!/usr/bin/python

import re

SEPARATOR = ','
ENCODED_SEPARATOR = '$$'
CSV_COMMENTED_LINE_REGEX = r'\".*?\"'

def _get_stats_obj(sp, me, ra, de, att, ne, pts):
    me = me if me=='-' else me+'+'
    ra = ra if ra=='-' else ra+'+'
    de = de+'+'
    return [sp, me, ra, de, att, ne, int(pts)]

def separator_replacer(matchobj):
    return matchobj.group(0).replace(SEPARATOR, ENCODED_SEPARATOR)

def encode(line):
    return re.sub(CSV_COMMENTED_LINE_REGEX, separator_replacer, line)

def decode(text):
    return text.replace(ENCODED_SEPARATOR, SEPARATOR).strip().strip('"')

def split_line(line):
    return line.rstrip('\r\n').split(SEPARATOR)

class CsvParsingUtilities:

    def __init__(self, csv_separator_character=';'):
        #self.separator = csv_separator_character
        pass

    def get_elements(self, line):
        line = encode(line)
        elements = split_line(line)
        return [decode(text) for text in elements]

    def read_army(self, line):
        entry, order, armykey, armyname, short_armyname, alignment, size, sp, me, ra, de, att, ne, pts, special, options, version, status = self.get_elements(line)
        if entry != "army":
            error_logger.critical("Tried to read army properties of a non-army line", line)
        return entry, order, armykey, armyname, short_armyname, alignment, version, status

    def read_unit(self, line):
        entry, order, key, name, short_name, typ, size, sp, me, ra, de, att, ne, pts, special, options, version, status = self.get_elements(line)
        stats = _get_stats_obj(sp, me, ra, de, att, ne, pts)
        return entry, order, key, name, short_name, typ, size, stats, special, options, version, status

    def get_special_rule_components(self, name):
        parts = name.split('(')
        name = parts[0].strip()
        value = parts[1].split(')')[0] if len(parts)>1 else ""
        return name, value

csvutils = CsvParsingUtilities()

