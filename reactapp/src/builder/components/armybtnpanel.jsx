import React, { Component } from 'react';

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
        const listOfArmyButtons = this.state.armies.map(
            (armyObj) =>
                <ArmyBtn key={armyObj.key}
                         army={armyObj}
                         onClick={this.props.onClick} />
        );
        return (
            <div className="kb-armybtnpanel">
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
             onClick={ (e) =>
                 props.onClick(e, props.army.key, props.army.name)
             } >
            <img src={faceicon} alt="face-icon" />
        </div>
    );
}

