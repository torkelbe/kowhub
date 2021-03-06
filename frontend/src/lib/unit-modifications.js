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

    /*
     * Gain new special rule or ranged attack
     * Example:
     *      type = "special"
     *      value = "ind"
     *      --> Gain special rule 'Individual'
     */
    add: function(unit, type, value) {
        unit[type].push(value);
    },

    /*
     * Remove special rule or ranged attack
     * Example:
     *      type = "special"
     *      value = "ind"
     *      --> Lose special rule 'Individual'
     */
    rm: function(unit, type, value) {
        unit[type] = unit[type].filter(
            item => !item.startsWith(value)
        );
    },

    /*
     * Modify existing special rule or ranged attack by a value
     * Example:
     *      type = "ranged"
     *      value = "lbo:2"
     *      --> Increase value of 'Lightning Bolt' by 2
     */
    mod: function(unit, type, value) {
        _modifyRule(unit, type, value, false);
    },

    /*
     * Modify existing special rule or ranged attack by a value
     * OR gain new special rule or ranged attack with that value
     * Example:
     *      type = "special"
     *      value = "crs:1"
     *      --> Increase value of 'Crushing Strength' by 1
     *          OR gain 'Crushing Strength (1)'
     */
    extend: function(unit, type, value) {
        _modifyRule(unit, type, value, true);
    },

    /*
     * Set a Stat to a specific value, unless the new value is less than before
     * Example:
     *      stat = "Sp"
     *      value = "10"
     *      --> Set Speed to 10
     */
    set: function(unit, stat, value) {
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

    /*
     * Improve the value of a Stat by 1
     * Example:
     *      stat = "Me"
     *      --> Improve 'Me' by 1 (Example: from '5+' to '4+')
     */
    inc: function(unit, stat, undef) {
        let oldValue = unit.stats[stat];
        if (stat === "Sp" || stat === "Att") {
            const newValue = (parseInt(oldValue) + 1) + "";
        } else if (stat === "Me" || stat === "Ra") {
            if (oldValue === "-" || oldValue === "2+")  return;
            const newValue = (parseInt(oldValue.substr(0,1), 10) - 1) + "+";
        } else if (stat === "De") {
            if (oldValue === "-" || oldValue === "6+")  return;
            const newValue = (parseInt(oldValue.substr(0,1), 10) + 1) + "+";
        } else if (stat === "Ne") {
            let [waver, rout] = oldValue.split("/");
            waver = waver === "-" ? waver : parseInt(waver, 10) + 1;
            rout = parseInt(rout, 10) + 1;
            const newValue = waver + "/" + rout;
        } else {
            throw new Error("UnitModifierError: 'inc' - " + stat);
        }
    },

    /*
     * Reduce the value of a Stat by 1
     * Example:
     *      stat = "Me"
     *      --> Reduce 'Me' by 1 (Example: from '4+' to '5+')
     */
    dec: function(unit, stat, undef) {
        let oldValue = unit.stats[stat];
        if (stat === "Sp" || stat === "Att") {
            const newValue = (parseInt(oldValue) - 1) + "";
        } else if (stat === "Me" || stat === "Ra") {
            if (oldValue === "-" || oldValue === "6+")  return;
            const newValue = (parseInt(oldValue.substr(0,1), 10) + 1) + "+";
        } else if (stat === "De") {
            if (oldValue === "-" || oldValue === "2+")  return;
            const newValue = (parseInt(oldValue.substr(0,1), 10) - 1) + "+";
        } else if (stat === "Ne") {
            let [waver, rout] = oldValue.split("/");
            waver = waver === "-" ? waver : parseInt(waver, 10) - 1;
            rout = parseInt(rout, 10) - 1;
            const newValue = waver + "/" + rout;
        } else {
            throw new Error("UnitModifierError: 'dec' - " + stat);
        }
    },

    /*
     * Change the value of any attribute of a unit
     * Example:
     *      attribute = "type"
     *      value = "Cavalry"
     *      --> Set { type: 'Cavalry' }
     */
    change: function(unit, attribute, value) {
        if (!unit[attribute]) throw new Error("UnitModifierError: 'change' - " + attribute);
        unit[attribute] = value;
    },

    /*
     * Collection of possible, non-standard changes
     * Example:
     *      type = "fearless"
     *      --> Set Waver value of a unit to '-'
     */
    custom: function(unit, type, value) {
        if (type === "fearless") {
            const [waver, rout] = unit.stats["Ne"].split("/");
            unit.stats["Ne"] = "-/" + rout;
        } else {
            throw new Error("UnitModifierError: 'custom' - " + type);
        }
    }
}

