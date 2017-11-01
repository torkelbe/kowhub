import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import UserListsPanel from './userlistspanel';
import BrowsePanel from './browsepanel';
import IconButton from './iconbutton';

export default class LeftPanel extends Component {
    /*
     * Receives as props:   activeListId
     *                      allLists
     *                      handleNewList
     *                      handleRemoveList
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
                        handleRemoveList={this.props.handleRemoveList}
                        handleUserListSelect={this.props.handleUserListSelect} />
                    <div  className="kb-newlistbutton">
                        <IconButton type="new" onClick={this.props.handleNewList} />
                    </div>
                </TabPanel>
                <TabPanel>
                    <BrowsePanel
                        handleAddUnit={this.props.handleAddUnit} />
                </TabPanel>
            </Tabs>
        );
    }
}

