#!/usr/bin/python
import sys

class ErrorLogger():

    def message(self, message):
        print >>sys.stderr, message

    def warning(self, message, item1="", item2=""):
        print >>sys.stderr, message + (":  '"+item1 if item1 else "") + ("' - '"+item2+"'" if item2 else "'")

    def critical(self, message, item1="", item2=""):
        self.warning("CRITICAL! "+message, item1, item2)
        raw_input("(Press Enter to continue)")

error_logger = ErrorLogger()

