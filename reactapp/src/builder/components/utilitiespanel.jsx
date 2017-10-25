import React, { Component } from 'react';

import UtilitiesBox from './utilitiesbox';

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
                    <UtilitiesBtn
                        type={"NEW"}
                        onClick={this.props.handleNewList} />
                    <UtilitiesBtn
                        type={"DEL"}
                        onClick={this.props.handleRemoveList} />
                </div>
            </div>
        );
    }
}

function UtilitiesBtn(props) {
    return (
        <div className="kb-utilities__btn" onClick={(e) => props.onClick(e)}>
            {props.type}
        </div>
    );
}

