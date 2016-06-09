import os
import json
import subprocess

import time

MODULEDIR = os.path.dirname(os.path.abspath(__file__))

ARMYDATAFILE = "data/armies.json"
HEADER_TMPL = MODULEDIR+"/templates/header_tmpl.tex"
UNIT_TMPL = MODULEDIR+"/templates/unit_tmpl.tex"
FOOTER_TMPL = MODULEDIR+"/templates/footer_tmpl.tex"

def load_army_data():
    with open(ARMYDATAFILE, 'r') as f:
        obj = json.loads(f.read())
    return obj

def unit_data(unit, data):
    army_key = unit[0]
    name_key = unit[1]
    size = unit[2]
    options = unit[3]
    obj = {}
    u = data.get(army_key).get("units").get(name_key)
    obj["name"] = u.get("name") + " " + size
    obj["Sp"] = u.get(size).get("Sp")
    obj["Me"] = u.get(size).get("Me")
    obj["Ra"] = u.get(size).get("Ra")
    obj["De"] = u.get(size).get("De")
    obj["Att"] = u.get(size).get("Att")
    obj["Ne"] = u.get(size).get("Ne")
    obj["Pts"] = u.get(size).get("Pts")
    obj["special_rules"] = ""
    obj["power"] = ""
    obj["ranged"] = ""
    return obj

def make_latex_pdf(armylist, datafile):
    fileid = str(time.time()%1).split('.')[1]
    filepath = MODULEDIR+ '/temp/' + fileid
    with open(datafile, 'r') as f:
        armydata = json.loads(f.read())
    with open(filepath+".tex", 'w') as tex:
        with open(HEADER_TMPL, 'r') as header:
            tex.write(header.read() % armylist)
        with open(UNIT_TMPL, 'r') as f:
            unit_tmpl = f.read()
        for unit in armylist.get("units"):
            tex.write(unit_tmpl % unit_data(unit, armydata))
        footer_data = {}
        with open(FOOTER_TMPL, 'r') as footer:
            tex.write(footer.read() % footer_data)

    cmd = ['pdflatex', '-output-directory', 'temp', '-interaction', 'nonstopmode', filepath+'.tex']
    proc = subprocess.Popen(cmd, cwd=MODULEDIR)
    proc.communicate()

    retcode = proc.returncode
    if not retcode == 0:
        os.unlink(filepath+'.pdf')
        raise ValueError('Error {} executing command: {}'.format(retcode, ' '.join(cmd))) 

    templist = [filepath+".tex", filepath+".log", filepath+".aux"]
    for filename in templist:
        os.unlink(filename)

    return fileid
