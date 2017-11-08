import React, { Component } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import TransitionItem from './transitionitem';
import UserList from './userlist';

const SortableItem = SortableElement( ({listIndex, ...props}) =>
    <TransitionItem {...props} index={listIndex} >
        <UserList />
    </TransitionItem>
);

const SortableList = SortableContainer( (props) => {
    return (
        <div className="kb-userlistspanel" >
            {props.lists.map( (list, index) => (
                <SortableItem
                    key={list.meta.id}
                    index={index}
                    timeout={300}
                    in={list.in}
                    isSelected={index === props.activeIndex}
                    meta={list.meta}
                    listIndex={index}
                    handleExited={() => props.handleRemoveList(list.meta.id)}
                    handleListTransitionExit={props.handleListTransitionExit}
                    handleUserListSelect={props.handleUserListSelect}
                />
            ))}
        </div>
    );
});

export default class UserListsPanel extends Component {
    /*
     * Receives as props:   activeIndex
     *                      lists
     *                      handleRemoveList
     *                      handleUserListSelect
     *                      handleListTransitionExit
     *                      handleReorderLists
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        if (!this.props.lists[0]) return null;
        return (
            <SortableList {...this.props}
                onSortEnd={this.props.handleReorderLists}
                lockAxis={"y"}
                pressDelay={200}
                helperClass="draggedComponent"
            />
        );
    }
}

