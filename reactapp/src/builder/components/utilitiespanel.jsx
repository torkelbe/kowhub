import React, { Component } from 'react';

import UtilitiesBox from './utilitiesbox';
import IconButton from './iconbutton.jsx';

export default class UtilitiesPanel extends Component {
    /*
     * Receives as props:   handleNewList
     *                      handleRemoveList
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className="kb-utilities">
                <UtilitiesBox />
                <div className="kb-utilities__btnpanel">
                    <IconButton type="new"
                                onClick={this.props.handleNewList} />
                    <IconButton type="delete"
                                onClick={this.props.handleRemoveList} />
                </div>
            </div>
        );
    }
}

