import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import UserListsPanel from './userlistspanel';
import BrowsePanel from './browsepanel';

export default class LeftPanel extends Component {
    /*
     * Receives as props:   activeListId
     *                      allLists
     *                      handleNewList
     *                      handleAddUnit
     *                      handleUserListSelect
     */
    constructor(props) {
        super(props);
        this.state = {
            tabIndex: 0,
        }
    }

    render() {
        return (
            <Tabs className="kb-leftpanel react-tabs" 
                  selectedIndex={this.state.tabIndex}
                  onSelect={ (tabIndex) => this.setState({ tabIndex }) }
                  forceRenderTabPanel={true} >
                <TabList>
                    <Tab>Lists</Tab>
                    <Tab>Browse</Tab>
                </TabList>
                <TabPanel>
                    <UserListsPanel
                        activeListId={this.props.activeListId}
                        allLists={this.props.allLists}
                        handleNewList={this.props.handleNewList}
                        handleUserListSelect={this.props.handleUserListSelect} />
                </TabPanel>
                <TabPanel>
                    <BrowsePanel
                        handleAddUnit={this.props.handleAddUnit} />
                </TabPanel>
            </Tabs>
        );
    }
}

