import React, { Component } from 'react';

import ArmyBtnPanel from './armybtnpanel';
import UnitBtnPanel from './unitbtnpanel';

export default class BrowsePanel extends Component {
    /*
     * Receives as props:   handleAddUnit
     */
    constructor(props) {
        super(props);
        this.state = {
            armykey: "",
            armyname: "",
        }
        this.handleArmySelect = this.handleArmySelect.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    handleArmySelect(e, newKey, newName) {
        e.preventDefault();
        this.setState({
            armykey: newKey,
            armyname: newName,
        });
        console.log("You selected army: " + newKey);
    }

    handleReset(e) {
        e.preventDefault();
        this.setState({ armykey: "" });
        console.log("You returned to army-button view.");
    }

    render() {
        return (
            <div className="kb-browsepanel">
                <ResetBtn
                    isActive={this.state.armykey != ""}
                    onClick={this.handleReset} />
                <ArmyBtnPanel
                    isActive={this.state.armykey === ""}
                    onClick={this.handleArmySelect} />
                <UnitBtnPanel
                    isActive={this.state.armykey != ""}
                    armykey={this.state.armykey}
                    armyname={this.state.armyname}
                    handleAddUnit={this.props.handleAddUnit} />
            </div>
        );
    }
}

function ResetBtn(props) {
    if (!props.isActive) {
        return null;
    }
    return (
        <div className="kb-resetbtn"
             onClick={(e) => props.onClick(e)} >
            RETURN
        </div>
    )
}

