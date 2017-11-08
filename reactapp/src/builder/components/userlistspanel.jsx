import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import TransitionItem from './transitionitem';
import UserList from './userlist';

export default function UserListsPanel({handleReorderLists, ...passThroughProps}) {
    return (
        <SortableList
            onSortEnd={handleReorderLists}
            lockAxis={"y"}
            pressDelay={200}
            helperClass="draggedComponent"
            {...passThroughProps}
        />
    );
}

const SortableList = SortableContainer(
    ({lists, activeIndex, handleRemoveList, ...passThroughProps}) => {
        const listElements = lists.map(
            (list, index) => (
                <SortableItem
                    // consumed by SortableContainer:
                    key={list.meta.id}
                    index={index}
                    // consumed by TransitionItem:
                    exitTrigger={list.exitTrigger === true ? true : false}
                    onExited={ () => handleRemoveList(list.meta.id) }
                    // passed on:
                    {...passThroughProps}
                    passThroughIndex={index}
                    isSelected={index === activeIndex}
                    meta={list.meta}
                />
            )
        );
        return (
            <div className="kb-userlistspanel" >
                {listElements}
            </div>
        );
    }
);

const SortableItem = SortableElement(
    ({onExited, exitTrigger, passThroughIndex, ...passThroughProps}) => {
        return (
            <TransitionItem onExited={onExited}
                            exitTrigger={exitTrigger}
                            timeout={300} >
                <UserList {...passThroughProps} index={passThroughIndex} />
            </TransitionItem>
        );
    }
);

