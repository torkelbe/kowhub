import src from 'temp/source-data';
import modifierLib from 'unit-modifications';

const formString = {
    "t": "Troop",
    "r": "Regiment",
    "h": "Horde",
    "l": "Legion",
    "x": "Hero",
    "m": "Monster",
    "e": "War Engine",
}

function _formatStats(stats) {
    return {
        "Sp": stats[0],
        "Me": stats[1],
        "Ra": stats[2],
        "De": stats[3],
        "Att": stats[4],
        "Ne": stats[5]
    }
}

function _applyOption(unit, unitkey, optionType, optionCode) {
    const option = (
        optionType === "$" ?
        src.items[optionCode] :
        src.options[unitkey][optionCode]
    );
    unit.options.push(option.name);
    unit.points += option.pts;
    for (const [func, type, value] of option.mod) {
        modifierLib[func](unit, type, value); // Modifies 'unit' in-place
    }
}

function _formatSpecialRules(special) {
    const specialNames = special.map( (specialKey) => {
        const [key, value] = specialKey.split(":");
        return src.special[key].name + (value ? " ("+value+")" : "");
    });
    return specialNames.join(", ");
}

function _formatRangedAttacks(ranged) {
    const rangedNames = ranged.map( (rangedKey) => {
        const [key, value] = rangedKey.split(":");
        const item = src.ranged[key];
        return "["+item.range+"\"] " + item.name + (value ? " ("+value+")" : "");
    });
    return rangedNames.join(", ");
}

function _formatUnitOutput(unit, form, options) {
    const output = {
        points: unit[form][6],
        name: unit.name,
        type: unit.type,
        form: formString[form],
        stats: _formatStats(unit[form]),
        special: unit.special,
        ranged: unit.ranged,
        options: [], // Text representations of options
    }
    for (let i = 0; i < Math.floor(options.length / 4); i++) {
        _applyOption(output, unit.key, options.substr(4*i, 1), options.substr(4*i+1,3));
    }
    output.special = _formatSpecialRules(output.special);
    output.ranged = _formatRangedAttacks(output.ranged);
    return output;
}

const source_data_api = {

    /* Used by 'ArmyBtnPanel' component to generate army buttons */
    getAllArmies: function() {
        const armies_list = [];
        Object.entries(src.armies).forEach( ([key, army]) => {
                armies_list.push({
                    key: key,
                    name: army.name,
                    sname: army.sname,
                    alignment: army.alignment,
                    order: army.order,
                });
        });
        armies_list.sort(function(a, b) {
            return a.order - b.order;
        });
        return armies_list;
    },

    getArmyData: (army_id) => {
        return {
            name: src.armies[army_id].name,
            sname: src.armies[army_id].sname,
            aligntment: src.armies[army_id].alignment,
        };
    },

    /* Used by 'UnitBtnPanel' component to generate unit choice buttons */
    getAllUnits: (army_id) => {
        const army = src.armies[army_id];
        const unit_list = [];
        Object.entries(army.units).forEach( ([key, unit]) => {
            unit_list.push(unit);
        });
        unit_list.sort(function(a, b) {
            return a.order - b.order;
        });
        return unit_list;
    },

    getUnit: (unit_id) => {
        /* This function will eventually also handle options */
        const unit = src.armies[unit_id.substr(0,2)].units[unit_id.substr(0,4)];
        const form = unit_id.substr(4,1);
        const options = unit_id.substr(5);
        return _formatUnitOutput(unit, form, options);
    },

    getSpecial: (id) => {
        return src.special[id];
    },

    getItem: (id) => {
        return src.items[id];
    },

    getRanged: (id) => {
        return src.ranged[id];
    },
};

export default source_data_api;

