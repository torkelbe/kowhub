import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import storage from 'webstorage-api';
import TransitionItem from './transitionitem';
import UserList from './userlist';

const store = {
    user: "userlists",
}

export default class UserListsPanel extends Component {
    /*
     * Receives as props:   activeListId  <-- not yet used
     *                      allLists
     *                      handleRemoveList
     *                      handleUserListSelect
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const listOfUserLists = Object.keys(this.props.allLists).map(
            (listId) => {
                return (
                    <TransitionItem key={listId} timeout={200}>
                        <UserList isSelected={listId === this.props.activeListId}
                                  meta={this.props.allLists[listId].meta}
                                  onClick={this.props.handleUserListSelect} />
                    </TransitionItem>
                );
            }
        );
        return (
            <div className="kb-userlistspanel">
                <TransitionGroup className="kb-userlistspanel__lists">
                    {listOfUserLists}
                </TransitionGroup>
            </div>
        );
    }
}

