import React, { Component } from 'react';

import data from 'source-data-api';

export default class UserListHeader extends Component {
    /*
     * Receives as props:   list
     *                      handleMetaChange
     */

    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        if (!this.props.list) {
            return (
                <div className="kb-userlistheader">
                </div>
            );
        } else {
            return (
                <div className="kb-userlistheader">
                    <UserListTitle
                        name={this.props.list.meta.name}
                        onChange={this.props.handleMetaChange} />
                    <UserListArmyBtn
                        armyKey={this.props.list.meta.army}
                        onClick={this.props.handleMetaChange} />
                    <UserListPointsBtn
                        points={this.props.list.meta.pts}
                        onClick={this.props.handleMetaChange} />
                </div>
            );
        }
    }
}

function UserListTitle(props) {
    return (
        <p className="kb-userlistheader__title">
            {props.name}
        </p>
    );
}

function UserListArmyBtn(props) {
    // Should probably render some cool image here instead
    return (
        <div className="kb-userlistheader__army">
            {props.army}
        </div>
    );
}

function UserListPointsBtn(props) {
    return (
        <div className="kb-userlistheader__pts">
            {props.points}
        </div>
    );
}

