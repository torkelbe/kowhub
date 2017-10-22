import React, { Component } from 'react';

import UserListsPanel from './userlistspanel';
import ArmyBtnPanel from './armybtnpanel';
import UnitBtnPanel from './unitbtnpanel';

const panelMode = {
    lists: "UserListsPanel",
    armies: "ArmyBtnPanel",
    units: "UnitBtnPanel",
}

export default class LeftPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: panelMode.armies,
        }
    }

    handleArmySelect(e, armykey) {
        e.preventDefault();
        console.log("You selected army: " + armykey);
    }

    render() {
        return (
            <div className="kb-leftpanel">
                <div className="kb-lp-header"></div>
                <div className="kb-lp-main">
                    <UserListsPanel
                        isActive={this.state.mode === panelMode.lists}
                        onClick={this.props.handleUserListSelect} />
                    <ArmyBtnPanel
                        isActive={this.state.mode === panelMode.armies}
                        onClick={this.handleArmySelect} />
                    <UnitBtnPanel
                        isActive={this.state.mode === panelMode.units}
                        onClick={this.props.handleUnitSelect}
                        armykey="ba" />
                </div>
            </div>
        );
    }
}

