import React, { Component } from 'react';

import storage from 'webstorage-api';

import Header from './header';
import LeftPanel from './leftpanel';
import RightPanel from './rightpanel';

export default class BuilderApp extends Component {

    constructor(props) {
        super(props);
        storage.initItem("userlists", function() {
            console.log("Webstorage item 'userlists' created.");
        }, storage.errorLogger);
    }

    handleUserListSelect(e, listId) {
        e.preventDefault();
        console.log("You selected list: " + listid);
    }
    
    handleUnitSelect(e, unitkey) {
        e.preventDefault();
        console.log("You selected unit: " + unitkey);
    }

    render() {
        return (
            <div className="kb-kowhub-builder-app">
                <Header />
                <div className="kb-main">
                    <div className="kb-main-left">
                        <LeftPanel handleUnitSelect={this.handleUnitSelect}
                                   handleUserListSelect={this.handleUserListSelect} />
                    </div>
                    <div className="kb-main-right">
                        <RightPanel />
                    </div>
                </div>
                <div className="kb-footer"></div>
            </div>
        );
    }
}

