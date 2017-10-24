import src from 'temp/source-data';

const formString = {
    "t": "Troop",
    "r": "Regiment",
    "h": "Horde",
    "l": "Legion",
    "h": "Hero",
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

function _formatSpecialRules(special) {
    specialNames = special.map( (specialKey) => {
        [key, value] = specialKey.split(":");
        return src.special[specialKey].name + (value ? " ("+value+")" : "");
    });
    return specialNames.join(", ");
}

function _formatRangedAttacks(ranged) {
    rangedNames = ranged.map( (rangedKey) => {
        rangedItem = src.ranged[rangedKey];
        return rangedItem.name + " (" + rangedItem.range + "\")";
    });
    return rangedNames.join(", ");
}

function _formatUnitOutput(unit, form) {
    output = {
        points: unit[form][6],
        name: unit.name,
        type: unit.type,
        form: formString[form],
        stats: _formatStats(unit[form]),
        special: _formatSpecialRules(unit.special),
        ranged: _formatRangedAttacks(unit.ranged),
    }
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
        const army = src.armies[unit_id.substr(0,2)];
        const unit = army.units[unit_id.substr(0,4)];
        const form = unit_id.substr(4,1);
        return _formatUnitOutput(unit, form);
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

