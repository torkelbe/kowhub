import React, { Component } from 'react';

import data from 'source-data-api';
import UnitBtnSection from './unitbtnsection';

export default class UnitBtnPanel extends Component {
    /*
     * Receives as props:   isActive
     *                      armykey
     *                      armyname
     *                      handleAddUnit
     */
    constructor(props) {
        super(props);
        this.state = {
            groups: [],
            monsters: [],
            warengines: [],
            heroes: [],
        };
    }

    componentWillReceiveProps(newProps) {
        if (!newProps.isActive){
            return;
        } else if (this.props.armykey != newProps.armykey) {
            const allUnits = data.getAllUnits(newProps.armykey);
            this.setState({
                groups: allUnits.filter( unit => {
                    return ( ('t' in unit) || ('r' in unit) || ('h' in unit) || ('l' in unit) );
                }),
                monsters: allUnits.filter( unit => {
                    return ( 'm' in unit );
                }),
                warengines: allUnits.filter( unit => {
                    return ( 'e' in unit );
                }),
                heroes: allUnits.filter( unit => {
                    return ( 'x' in unit );
                }),
            });
        }
    }

    render() {
        if (!this.props.isActive) {
            return null;
        }
        return (
            /* Pass as props: units, selectors, handleAddUnit */
            <div className="kb-unitbtnpanel kb-lp-display">
                <div className="kb-unitbtnpanel__title">{this.props.armyname}</div>
                <UnitBtnSection units={this.state.groups}
                                selectors={['t', 'r', 'h', 'l']}
                                handleAddUnit={this.props.handleAddUnit} />
                <UnitBtnSection units={this.state.monsters}
                                selectors={['m']}
                                handleAddUnit={this.props.handleAddUnit} />
                <UnitBtnSection units={this.state.warengines}
                                selectors={['e']}
                                handleAddUnit={this.props.handleAddUnit} />
                <UnitBtnSection units={this.state.heroes}
                                selectors={['x']}
                                handleAddUnit={this.props.handleAddUnit} />
            </div>
        );
    }
}

