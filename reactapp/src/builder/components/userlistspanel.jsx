import React, { Component } from 'react';
import { TransitionGroup } from 'react-transition-group';

import storage from 'webstorage-api';
import TransitionItem from './transitionitem';
import UserList from './userlist';
import IconButton from './iconbutton';

const store = {
    user: "userlists",
}

export default class UserListsPanel extends Component {
    /*
     * Receives as props:   activeListId  <-- not yet used
     *                      allLists
     *                      handleNewList
     *                      handleRemoveList
     *                      handleUserListSelect
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

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
                    <TransitionItem key={listId}>
                        <UserList isSelected={listId === this.props.activeListId}
                                  meta={this.props.allLists[listId].meta}
                                  onClick={this.props.handleUserListSelect} />
                    </TransitionItem>
                );
            }
        );
        return (
            <TransitionGroup className="kb-userlistspanel">
                {listOfUserLists}
                <div className="kb-newlistbutton">
                    <IconButton type="new" onClick={this.props.handleNewList} />
                </div>
            </TransitionGroup>
        );
    }
}

