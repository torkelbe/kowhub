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
     * Receives as props:   activeIndex
     *                      lists
     *                      handleRemoveList
     *                      handleUserListSelect
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        const listOfUserLists = this.props.lists.map(
            (list, index) => {
                return (
                    <TransitionItem key={list.meta.id} timeout={200}>
                        <UserList isSelected={index === this.props.activeIndex}
                                  meta={list.meta}
                                  index={index}
                                  handleRemoveList={this.props.handleRemoveList}
                                  handleUserListSelect={this.props.handleUserListSelect} />
                    </TransitionItem>
                );
            }
        );
        return (
            <TransitionGroup className="kb-userlistspanel">
                {listOfUserLists}
            </TransitionGroup>
        );
    }
}

