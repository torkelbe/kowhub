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
        storage.newList(store.user, {},
            (lists, index) => {
                this.setState({
                    activeIndex: index,
                    allLists: lists
                });
                console.log("Made a new, default list at index " + index);
            },
            storage.errorLogger
        );
    }

    handleRemoveList = (e, index) => {
        e.preventDefault();
        if (index === undefined) index = this.state.activeIndex;
        let nextIndex = this.state.activeIndex;
        if (nextIndex === this.state.allLists.length - 1) nextIndex -= 1; 
        console.log("Next list index: " + nextIndex);
        storage.removeList(store.user, this.state.activeIndex,
            (lists, removedList) => {
                this.setState({
                    activeIndex: nextIndex,
                    allLists: lists
                });
                console.log("Removed list with index " + index);
            },
            storage.errorLogger
        );
    }

    handleAddUnit = (e, unitkey) => {
        e.preventDefault();
        if (!this.state.lists[this.state.activeIndex]) {
            console.log("You have no active armylist to add a unit to.");
            return;
        }
        storage.addUnit(store.user, this.state.activeIndex, unitkey,
            (lists) => {
                this.setState({ allLists: lists });
                console.log("Added unit "+unitkey);
            },
            storage.errorLogger
        );
    }

    handleRemoveUnit = (e, unitIndex) => {
        e.preventDefault();
        storage.removeUnit(store.user, this.state.activeIndex, unitIndex,
            (lists, removedUnit) => {
                this.setState({ allLists: lists });
                console.log("Removed unit " + removedUnit.key);
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
                        allLists={this.state.allLists}
                        handleNewList={this.handleNewList}
                        handleAddUnit={this.handleAddUnit}
                        handleRemoveUnit={this.handleRemoveUnit}
                        handleUserListSelect={this.handleUserListSelect} />
                    <RightPanel
                        activeList={this.state.allLists[this.state.activeIndex]}
                        handleNewList={this.handleNewList}
                        handleRemoveList={this.handleRemoveList}
                        handleRemoveUnit={this.handleRemoveUnit}
                        handleMetaChange={this.handleMetaChange} />
                </div>
                <div className="kb-footer"></div>
            </div>
        );
    }
}

