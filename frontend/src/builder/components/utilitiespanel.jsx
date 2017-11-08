import React, { Component } from 'react';

import UtilitiesBox from './utilitiesbox';
import IconButton from './iconbutton.jsx';

export default class UtilitiesPanel extends Component {
    /*
     * Receives as props:
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
                </div>
            </div>
        );
    }
}

