import React, { Component } from 'react';

import UserListHeader from './userlistheader';
import UserListUnits from './userlistunits';
import UtilitiesPanel from './utilitiespanel';

export default class RightPanel extends Component {
    /*
     * Receives as props:   activeList
     *                      handleRemoveUnit
     *                      handleMetaChange
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    openListPdf = (e) => {
        e.preventDefault();
        /* Note: this only returns a placeholder PDF for now */
        window.open("pdf", "_blank");
    }
    
    render() {
        return (
            <div className="kb-rightpanel">
                <UserListHeader
                    list={this.props.activeList}
                    handleMetaChange={this.props.handleMetaChange} />
                <UserListUnits
                    list={this.props.activeList}
                    handleRemoveUnit={this.props.handleRemoveUnit} />
                <UtilitiesPanel
                    openListPdf={this.openListPdf} />
            </div>
        );
    }
}

