import React, { Component } from 'react';

export default class UserListUnits extends Component {
    /*
     * Receives as props:   list
     *                      handleRemoveUnit
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        let userListEntries = "";
        if (this.props.list) {
            userListEntries = Object.keys(this.props.list.units).map(
                (id) =>
                    <UserListUnit key={id}
                                  unitkey={this.props.list.units[id]} />
            );
        }
        return (
            <div className="kb-userlistunits">
                {userListEntries}
            </div>
        );
    }
}

function UserListUnit(props) {
    return (
        <div className="kb-userlistunits__unit">
            {props.unitkey}
        </div>
    );
}

