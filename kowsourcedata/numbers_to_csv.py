#!/usr/bin/python
#Author: Torkel Berli (torkelbe@gmail.com)
'''
Script for exporting Kings of War army and rules data in .numbers format
into .csv format.
For use on OS X only. It makes use of applescript to export from numbers.
The built-in applescript was written by Sohail Ahmed (http://sohail.io)
'''
import os
from sys import platform
from subprocess import Popen, PIPE
from utilities import data_location

scpt = '''
#! /usr/bin/osascript

(*
---------------------------------------------------------------------------------

 Script: SpreadsheetExportToCSV

 Command-line tool to convert a spreadsheet document to CSV
 This AppleScript is tested with and compatible with Apple iWork Numbers 3.6,
 current as at October 23, 2015.

 Parameters:
 1. Full Path to the input file, including file extension
 2. Full Path to the output file, including file extension

 Example command-line invocation:

    osascript SpreadsheetExportToCSV.scpt "/Users/me/Documents/MySpreadsheet.xlsx" "/Users/me/Documents/Converted/OutputFile.csv"

 The spreadsheet to use as an input file can be an Excel file or a Numbers file.

 Sohail Ahmed
 Blog: http://sohail.io
 Twitter: @idStar

 Creation Date: October 23, 2015
 
---------------------------------------------------------------------------------
*)

global _inputFilePathAlias
global _outputFilePath
global _requestedOptions


(*
 run

 This is our entry point, our main function, where this script 
 begins execution. We call out to helper functions, to modularize
 the design.
*)
on run argv
	-- Ensure our CSV files are encoding with UTF8:
	ensureUTF8Encoding()
	
	-- Parse and determine input/output paths:
	retrieveCommandLineArguments(argv)
	
	-- Perform the actual activation, file open, export and cleanup:
	processSpreadsheet()
	
end run




---------------------- SUPPORTING FUNCTIONS --------------------------

(*
 retrieveCommandLineArguments

 Handles parsing the command line arguments passed to us.
 We return a list, where the first element is the input file
 path as an alias. The second element is the output path,
 as text (as it may not yet exist).
*)
on retrieveCommandLineArguments(command_line_arguments)
	set _inputFilePathAlias to POSIX file (item 1 of command_line_arguments) as alias
	set _outputFilePath to (POSIX file (item 2 of command_line_arguments)) as text
	
	log "input file path is: " & _inputFilePathAlias
	log "output file path is: " & _outputFilePath
	
end retrieveCommandLineArguments


(*
 processSpreadsheet

 This function is the workhorse of this script. We open Numbers,
 have it load the source spreadsheet, and invoke the export command
 to ultimately write the output CSV to the specified path.
*)
on processSpreadsheet()
	tell application "Numbers"
		activate
		
		-- Before we open the file asked of us, close out every document 
		-- that might have opened along with the application having activated:
		--close every window saving no
		
		-- Retrieve information about the source file:
		set fileInfo to (info for (_inputFilePathAlias))
		set fileName to name of (fileInfo)
		set fileExtension to name extension of (fileInfo)
		log "Opening source document " & fileName & "..."
		
		tell (open _inputFilePathAlias)
			-- In this scope, we are now implicitly dealing with the document just opened
			-- as the current target, which means we access it through the "it" keyword,
			-- as per: https://developer.apple.com/library/mac/documentation/AppleScript/Conceptual/AppleScriptLangGuide/conceptual/ASLR_fundamentals.html#//apple_ref/doc/uid/TP40000983-CH218-SW4
			
			set activeDocument to it
			
			-- Note: We could have also gotten to the active document by walking the chain from the top,
			-- i.e. right from the Application object:
			--set activeDocument to document 1 of application "Numbers" 
			
			say "Starting Export."
			with timeout of 600 seconds
				export activeDocument as CSV to file _outputFilePath
				-- Use this instead if you want to export to Excel:
				-- export activeDocument as Microsoft Excel to file _outputFilePath 
			end timeout
			say "Completed Export."
			
			-- Since we closed out other windows that might have been open before
			-- opening the file we sought, we really should only have one document
			-- window open.
			--close activeDocument
		end tell
		
		--quit
		
	end tell
end processSpreadsheet


(*
 ensureUTF8Encoding

 Microsoft Excel on the Mac is not good with exporting special
 characters as is Apple Numbers. Part of this is in the ability for
 Numbers to correctly process UTF8 formatting when exporting.

 Setup default export encoding for CSV files to UTF8, so without 
 specifying anything further for AppleScript, the right format will 
 be applied automatically. Since we cannot specify the CSV export
 encoding via AppleScript, we will set it via the Defaults Database
 with a shell command.
 
 Here are the codes that apply: 4=UTF8, 12=windows latin, 30=MacRoman
 As such, we'll specify 4 for UTF8.

 This technique courtesy of: https://discussions.apple.com/thread/4018778?tstart=0 
*)
on ensureUTF8Encoding()
	do shell script "/usr/bin/defaults write com.apple.iWork.Numbers CSVExportEncoding -int 4"
end ensureUTF8Encoding
'''

# === External interface ===
def export():
    if not platform == "darwin":
        print "Cannot export data. Only for use on OS X"

    if os.path.exists(data_location.numbers.armies):
        print "Exporting armies data..."
        p = Popen(['osascript', '-', data_location.numbers.armies, data_location.csv.armies], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate(scpt)
        if stdout: print stdout
        if stderr: print stderr
        if not p.returncode:
            print "Armies data exported successfully"
        else:
            print "Error when exporting armies data. Returncode:", p.returncode
    else:
        print "Could not export armies data. Source file does not exist."

    if os.path.exists(data_location.numbers.rules):
        print "Exporting rules data..."
        p = Popen(['osascript', '-', data_location.numbers.rules, data_location.csv.rules], stdin=PIPE, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate(scpt)
        if stdout: print stdout
        if stderr: print stderr
        if not p.returncode:
            print "Rules data exported successfully"
        else:
            print "Error when exporting rules data. Returncode:", p.returncode
    else:
        print "Could not export rules data. Source file does not exist."
    
# === Main ===
if __name__ == "__main__":
    export()
