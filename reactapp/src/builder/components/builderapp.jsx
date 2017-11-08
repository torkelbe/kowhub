import React, { Component } from 'react';

import storage from 'webstorage-api';
import data from 'source-data-api';

import Header from './header';
import LeftPanel from './leftpanel';
import RightPanel from './rightpanel';

const store = {
    user: "userlists",
}

export default class BuilderApp extends Component {

    constructor(props) {
        super(props);
        let initLists = [];
        storage.initItem(store.user, [], (storageItem) => {
            console.log("Webstorage item "+store.user+" created.");
            console.log(storageItem);
            initLists = storageItem;
        }, storage.errorLogger);
        this.state = {
            activeIndex: 0,
            allLists: initLists,
        }
    }

    handleListTransitionExit = (e, index) => {
        e.preventDefault();
        if (index === undefined) index = this.state.activeIndex;
        if (!this.state.allLists[index]) return;
        const newLists = this.state.allLists;
        Object.assign(newLists[index], {in: false})
        this.setState({
            allLists: newLists
        });
    }

    handleReorderLists = ({oldIndex, newIndex}) => {
        let newActiveIndex = this.state.activeIndex;
        if (oldIndex === newActiveIndex) {
            newActiveIndex = newIndex;
        } else if (oldIndex > newActiveIndex && newIndex <= newActiveIndex) {
            newActiveIndex += 1;
        } else if (oldIndex < newActiveIndex && newIndex >= newActiveIndex) {
            newActiveIndex -= 1;
        }
        storage.reorderLists(store.user, oldIndex, newIndex,
            (lists) => {
                console.log("Reordered lists");
                console.log("-----------------------------");
                for (const list of lists) console.log(list.meta.name);
                this.setState({
                    activeIndex: newActiveIndex,
                    allLists: lists
                });
            },
            storage.errorLogger
        );
    }

    handleUserListSelect = (e, index) => {
        e.preventDefault();
        if (index === this.state.activeIndex) {
            console.log("That list is already active");
            return;
        }
        this.setState({ activeIndex: index });
        console.log("You selected new index: " + index);
    }

    handleNewList = (e) => {
        e.preventDefault();
        const tar = e.target.closest(".kb-newlistbutton").parentNode.firstChild;
        tar.scrollTop = 0;
        storage.newList(store.user, {},
            (lists, index) => {
                console.log("Added new list");
                console.log("-----------------------------");
                for (const list of lists) console.log(list.meta.name);
                this.setState({
                    activeIndex: index,
                    allLists: lists
                });
            },
            storage.errorLogger
        );
    }

    handleRemoveList = (listId) => {
        if (!listId) listId = this.state.allLists[this.state.activeList].meta.id;
        const deleteIndex = this.state.allLists.findIndex( list => list.meta.id === listId );
        const nextIndex = deleteIndex < this.state.activeIndex ?
                          this.state.activeIndex - 1 :
                          this.state.activeIndex;
        storage.removeList(store.user, listId,
            (lists, removedList) => {
                console.log("Removed list: "+removedList.meta.name);
                console.log("-----------------------------");
                for (const list of lists) console.log(list.meta.name);
                this.setState({
                    activeIndex: Math.min(nextIndex, lists.length - 1),
                    allLists: lists
                });
            },
            storage.errorLogger
        );
    }

    handleAddUnit = (e, unitkey) => {
        e.preventDefault();
        if (!this.state.allLists[this.state.activeIndex]) {
            console.log("You have no active armylist to add a unit to.");
            return;
        }
        storage.addUnit(store.user, this.state.activeIndex, unitkey,
            (lists) => {
                console.log("Added unit "+unitkey);
                console.log("-----------------------------");
                for (const list of lists) console.log(list.meta.name);
                this.setState({ allLists: lists });
            },
            storage.errorLogger
        );
    }

    handleRemoveUnit = (e, unitIndex) => {
        e.preventDefault();
        storage.removeUnit(store.user, this.state.activeIndex, unitIndex,
            (lists, removedUnit) => {
                console.log("Removed unit " + removedUnit.key);
                console.log("-----------------------------");
                for (const list of lists) console.log(list.meta.name);
                this.setState({ allLists: lists });
            },
            storage.errorLogger
        );
    }

    handleMetaChange = (newMeta) => {
        storage.setMeta(store.user, this.state.activeIndex, newMeta,
            (lists) => {
                this.setState({ allLists: lists });
                console.log("Changed meta for list with index " + this.state.activeIndex);
            },
            storage.errorLogger
        );
    }

    render() {
        return (
            <div className="kb-kowhub-builder-app">
                <Header />
                <div className="kb-main">
                    <LeftPanel
                        activeIndex={this.state.activeIndex}
                        lists={this.state.allLists}
                        handleNewList={this.handleNewList}
                        handleRemoveList={this.handleRemoveList}
                        handleAddUnit={this.handleAddUnit}
                        handleListTransitionExit={this.handleListTransitionExit}
                        handleReorderLists={this.handleReorderLists}
                        handleUserListSelect={this.handleUserListSelect} />
                    <RightPanel
                        activeList={this.state.allLists[this.state.activeIndex]}
                        handleRemoveUnit={this.handleRemoveUnit}
                        handleMetaChange={this.handleMetaChange} />
                </div>
                <div className="kb-footer"></div>
            </div>
        );
    }
}

