import React, { Component } from 'react';
import classNames from 'classnames';

import data from 'source-data-api';
import faceicon from 'faceicon.png';

export default class ArmyBtnPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            armies: data.getAllArmies(),
        };
    }

    render() {
        if (!this.props.isActive) {
            return null;
        }
        const classes = classNames(
            "kb-armybtnpanel",
            "kb-lp-display",
        );
        const listOfArmyButtons = this.state.armies.map(
            (armyObj) =>
                <ArmyBtn key={armyObj.key}
                         armykey={armyObj.key}
                         onClick={this.props.onClick} />
        );
        return (
            <div className={classes}>
                {listOfArmyButtons}
            </div>
        );
    }
}

function ArmyBtn(props) {

    // Need to eventually set image source based on armykey here.
    // Replace 'faceicon'

    return (
        <div className="kb-armybtn"
             armykey={props.armykey}
             onClick={(e) => props.onClick(e, props.armykey)} >
            <img src={faceicon} alt="face-icon" />
        </div>
    );
}

