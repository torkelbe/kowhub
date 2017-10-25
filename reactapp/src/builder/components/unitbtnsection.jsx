import React, { Component } from 'react';
import classNames from 'classnames';

const keymap = {
    't': 'Troop',
    'r': 'Regiment',
    'h': 'Horde',
    'l': 'Legion',
    'm': 'Monster',
    'e': 'War Engine',
    'x': 'Hero',
}

export default function UnitBtnSection(props) {
    /*
     * Receives as props:   units
                            selectors
                            handleAddUnit
     */
    if (!props.units.length) {
        return null;
    }
    const listOfUnits = props.units.map(
        unit => <UnitBtnRow key={unit.key}
                            unit={unit}
                            selectors={props.selectors}
                            onClick={props.handleAddUnit} />
    );
    return (
        <div className="kb-unitbtnpanel__section">
            <UnitBtnHeader selectors={props.selectors} />
            {listOfUnits}
        </div>
    )
}

function UnitBtnHeader(props) {
    const listOfTypes = props.selectors.map(
        char =>
            <div className="kb-unitbtnpanel__unittype" key={char} >
                {keymap[char]}
            </div>
    );
    return (
        <div className="kb-unitbtnpanel__header">
            <div className="kb-unitbtnpanel__unitname"></div>
            {listOfTypes}
        </div>
    );
}

function UnitBtnRow(props) {
    const listOfBtns = props.selectors.map(
        char => <UnitBtn key={char}
                         unitkey={props.unit.key + char}
                         stats={props.unit[char]}
                         onClick={props.onClick} />
    );
    return (
        <div className="kb-unitbtnpanel__row">
            <div className="kb-unitbtnpanel__unitname">{props.unit.name}</div>
            {listOfBtns}
        </div>
    );
}

function UnitBtn(props) {
    const classes = classNames({"kb-unitbtnpanel__btn": true, "disabled": !props.stats});
    const point_value = (props.stats) ? props.stats[6] : "-";
    const clickAction = (props.stats) ? (e) => props.onClick(e, props.unitkey) : null;
    return (
        <div className={classes} onClick={clickAction}>
            {point_value}
        </div>
    );
}
