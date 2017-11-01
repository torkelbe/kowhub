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
        const initMeta = {}
        storage.initItem(store.user, [], () => {
            console.log("Webstorage item "+store.user+" created.");
            storage.getAllLists(store.user, (allMeta) => {
                Object.assign(initMeta, allMeta);
            }, storage.errorLogger);
        }, storage.errorLogger);
        this.state = {
            activeListId: "",
            allLists: initMeta,
        }
    }

    handleUserListSelect = (e, listId) => {
        e.preventDefault();
        if (listId === this.state.activeListId) {
            console.log("That list is already active");
            return;
        }
        this.setState({ activeListId: listId });
        console.log("You selected new list: " + listId);
    }

    handleNewList = (e) => {
        e.preventDefault();
        storage.newList(store.user, {},
            (lists, newId) => {
                this.setState({
                    activeListId: newId,
                    allLists: lists
                });
                console.log("Made a new, default list! "+newId);
            },
            storage.errorLogger
        );
    }

    handleRemoveList = (e) => {
        e.preventDefault();
        const sortedLists = Object.keys(this.state.allLists).sort();
        const nextIndex = sortedLists.indexOf(this.state.activeListId) + 1;
        const nextListId = sortedLists[ nextIndex < sortedLists.length ? nextIndex : nextIndex - 2 ];
        console.log("Next list index: " + nextIndex + "   with ID: " + nextListId);
        storage.removeList(store.user, this.state.activeListId,
            (lists, removedList) => {
                this.setState({
                    activeListId: nextListId,
                    allLists: lists
                });
                console.log("Removed list:" + removedList.meta.id);
            },
            storage.errorLogger
        );
    }

    handleAddUnit = (e, unitkey) => {
        e.preventDefault();
        if (!this.state.activeListId) {
            console.log("You have no active armylist to add a unit to.");
            return;
        }
        storage.addUnit(store.user, this.state.activeListId, unitkey,
            (lists) => {
                this.setState({ allLists: lists });
                console.log("Added unit "+unitkey);
            },
            storage.errorLogger
        );
    }

    handleRemoveUnit = (e, unitId) => {
        e.preventDefault();
        storage.removeUnit(store.user, this.state.activeListId, unitId,
            (lists, removedUnit) => {
                this.setState({ allLists: lists });
                console.log("Removed unit " + removedUnit.unitkey);
            },
            storage.errorLogger
        );
    }

    handleMetaChange = (newMeta) => {
        storage.setMeta(store.user, this.state.activeListId, newMeta,
            (lists) => {
                this.setState({ allLists: lists });
                console.log("Changed meta for list: " + this.state.activeListId);
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
                        activeListId={this.state.activeListId}
                        allLists={this.state.allLists}
                        handleNewList={this.handleNewList}
                        handleAddUnit={this.handleAddUnit}
                        handleRemoveUnit={this.handleRemoveUnit}
                        handleUserListSelect={this.handleUserListSelect} />
                    <RightPanel
                        activeList={this.state.allLists[this.state.activeListId]}
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

