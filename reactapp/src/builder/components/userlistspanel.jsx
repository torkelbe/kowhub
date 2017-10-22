import React, { Component } from 'react';

import storage from 'webstorage-api';

export default class UserListsPanel extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userlists: this._getLists(),
        }
    }

    _getLists() {
        storage.getAllLists("userlists", function(userlists) {
            return userlists;
        }, function(code, msg) {
            storage.errorLogger(code, msg);
            return ([{
                list: {name: "(Could not access webstorage)", id: ""}
            }]);
        });
    }

    render() {
        if (!this.props.isActive) {
            return null;
        };
        const listOfUserLists = this.state.userlists.map( (listObj) =>
            <UserList
                key={listObj.id}
                list={listObj}
                onClick={this.props.onClick} />
        );
        return (
            <div className="kb-lp-display kp-userlistspanel">
                {listOfUserLists}
            </div>
        );
    }
}

function UserList(props) {
    return (
        <div className="kb-userlist"
             onClick={(e) => onClick(e, props.list.id)} >
            List with name {props.list.name}
        </div>
    );
}

