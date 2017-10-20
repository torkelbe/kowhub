import src from 'temp/source-data';

function _getStatsObj(s) {
    return {"Sp":s[0],"Me":s[1],"Ra":s[2],"De":s[3],"Att":s[4],"Ne":s[5],"Pts":s[6]}
}

const source_data_api = {

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
    },

    getAllUnits: (army_id) = {
        const army = src.armies.getElementById(army_id);
        const unit_list = [];
        Object.entries(army.units).forEach( ([key, unit]) => {
            unit_list.push(unit);
        });
        unit_list.sort(function(a, b) {
            return a.order - b.order;
        });
        return units_list;
    },

    // This function should probably select one of "Troop", "Regiment", etc
    getUnit: (unit_id) => {
        const army = src.armies.getElementById(unit_id.substr(0,2));
        const unit = army.units.getElementById(unit_id);
    },

    getSpecial: (id) => {
        return src.special.getElementById(id);
    },

    getItem: (id) => {
        return src.items.getElementById(id);
    },

    getRanged: (id) => {
        return src.ranged.getElementById(id);
    },
};

export default source_data_api;

