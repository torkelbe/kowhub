import React, { Component } from 'react';
import classNames from 'classnames';

import data from 'source-data-api';

export default class UnitBtnPanel extends Component {

    constructor(props) {
        super(props);
        const newUnits = data.getAllUnits(props.armykey);
        this.state = {
            units: newUnits,
        };
    }

    componentWillReceiveProps(newProps) {
        if(this.props.armykey != newProps.armykey) {
            const newUnits = data.getAllUnits(newProps.armykey);
            this.setState({
                units: newUnits,
                armykey: newProps.armykey,
            });
        }
    }

    render() {
        if (!this.props.isActive) {
            return null;
        }
        const classes = classNames(
            "kb-unitbtnpanel",
            "kb-lp-display"
        );
        const listOfUnits = this.state.units.map(
            (unitObj) =>
                <UnitBtn key={unitObj.key}
                         unit={unitObj}
                         onClick={this.props.onClick} />
        );
        return (
            <div className={classes}>
                {listOfUnits}
            </div>
        );
    }
}

function UnitBtn(props) {
    return (
        <div className="kb-unitbtn"
             onClick={(e) => props.onClick(e, props.unit.key)}>
            {props.unit.name}
        </div>
    )
}

