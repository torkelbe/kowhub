function _modifyRule(unit, type, value, acceptNewRule) {
    const [key, modifier] = value.split(":");
    const index = unit[type].findIndex(
        item => item.startsWith(key)
    );
    if (index < 0) {
        if (acceptNewRule) {
            unit[type].push(value);
        }
        return;
    }
    const oldValue = unit[type][index].split(":")[1];
    if (oldValue === "") {
        throw new Error("UnitModifierError: "+type+" - mod - "+value);
    }
    const newValue = parseInt(oldValue, 10) + parseInt(modifier, 10);
    unit[type][index] = key + ":" + newValue;
}

export default {

    add: function(unit, type, value) {
        /* Ex type = "special", value = "ind" */
        unit[type].push(value);
    },

    rm: function(unit, type, value) {
        /* Ex type = "special", value = "ind" */
        unit[type] = unit[type].filter(
            item => !item.startsWith(value)
        );
    },

    mod: function(unit, type, value) {
        /* Ex: type = "ranged", value = "lgb:2" */
        _modifyRule(unit, type, value, false);
    },

    extend: function(unit, type, value) {
        /* Ex: type = "special", value = "crs:1" */
        _modifyRule(unit, type, value, true);
    },

    set: function(unit, stat, value) {
        /* Ex: stat = "Sp", value = "10" */
        const oldValue = unit.stats[stat];
        if (stat === "Sp" || stat === "Att") {
            const newValue = (value > oldValue) ? value : oldValue;
        } else if (stat === "Me" || stat === "Ra" || stat === "De") {
            const newValue = (value < oldValue || oldValue === "-") ? value : oldValue;
        } else {
            throw new Error("UnitModifierError: "+stat+" - "+value);
            return;
        }
        unit.stats[stat] = newValue;
    },

    inc: function(unit, stat, undef) {
        /* Ex: stat = "Me" */
        let oldValue = unit.stats[stat];
        if (stat === "Sp" || stat === "Att") {
            const newValue = (parseInt(oldValue) + 1) + "";
        } else if (stat === "Me" || stat === "Ra" || stat === "De") {
            if (oldValue === "-")  return;
            const newValue = (parseInt(oldValue.substr(0,1), 10) - 1) + "+";
        } else if (stat === "Ne") {
            let [waver, rout] = oldValue.split("/");
            waver = waver === "-" ? waver : parseInt(waver, 10) + 1;
            rout = parseInt(rout, 10) + 1;
            const newValue = waver + "/" + rout;
        } else {
            throw new Error("UnitModifierError: 'inc' - " + stat);
        }
    },

    dec: function(unit, stat, undef) {
        /* Ex: stat = "Me" */
        let oldValue = unit.stats[stat];
        if (stat === "Sp" || stat === "Att") {
            const newValue = (parseInt(oldValue) - 1) + "";
        } else if (stat === "Me" || stat === "Ra" || stat === "De") {
            if (oldValue === "-") {
                return;
            } else {
                const newValue = (parseInt(oldValue.substr(0,1), 10) - 1) + "+";
            }
        } else if (stat === "Ne") {
            let [waver, rout] = oldValue.split("/");
            waver = waver === "-" ? waver : parseInt(waver, 10) - 1;
            rout = parseInt(rout, 10) - 1;
            const newValue = waver + "/" + rout;
        } else {
            throw new Error("UnitModifierError: 'dec' - " + stat);
        }
    },

    change: function(unit, attribute, value) {
        /* Ex: type = "type", value = "Cavalry" */
        if (!unit[attribute]) throw new Error("UnitModifierError: 'change' - " + attribute);
        unit[attribute] = value;
    },

    custom: function(unit, type, value) {
        /* Used for specific, custom cases */
        if (type === "fearless") {
            const [waver, rout] = unit.stats["Ne"].split("/");
            unit.stats["Ne"] = "-/" + rout;
        } else {
            throw new Error("UnitModifierError: 'custom' - " + type);
        }
    }
}

