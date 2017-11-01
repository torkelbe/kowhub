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
        const userListEntries = this.props.list.units.map(
            (unit, index) =>
                <UserListUnit
                    key={unit.id}
                    unitkey={unit.key}
                    index={index}
                />
        );
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

