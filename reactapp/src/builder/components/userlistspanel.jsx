import React, { Component } from 'react';

import storage from 'webstorage-api';
import UserList from './userlist';

const store = {
    user: "userlists",
}

export default class UserListsPanel extends Component {
    /*
     * Receives as props:   activeListId  <-- not yet used
     *                      allLists
     *                      handleNewList
     *                      handleUserListSelect
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

/*
Placeholder values received from webstorage API
    {
        name: "Very long list name I will take to tournament sometime next week",
        pts: 2000,
        count: 10,
        army: "ba",
        id: "hihihi",
    },
    {
        name: "Not-so-good list (MSU)",
        pts: 1900,
        count: 21,
        army: "dw",
        id: "nooooo",
    },
*/

    render() {
        if (Object.keys(this.props.allLists).length < 1) {
            console.log("'allLists' is empty: length = "+Object.keys(this.props.allLists).length);
            return (
                <div>"EMPTY"</div>
            );
        }
        const listOfUserLists = Object.keys(this.props.allLists).map(
            (listId) => {
                return (
                    <UserList key={listId}
                              isSelected={listId === this.props.activeListId}
                              meta={this.props.allLists[listId].meta}
                              onClick={this.props.handleUserListSelect} />
                );
            }
        );
        return (
            <div className="kb-userlistspanel">
                {listOfUserLists}
            </div>
        );
    }
}

