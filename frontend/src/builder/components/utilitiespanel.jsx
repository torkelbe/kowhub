import React, { Component } from 'react';

import UtilitiesBox from './utilitiesbox';
import IconButton from './iconbutton';

export default class UtilitiesPanel extends Component {
    /*
     * Receives as props:       openListPdf
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
                    <IconButton type="print" onClick={this.props.openListPdf} />
                </div>
            </div>
        );
    }
}

