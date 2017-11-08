import React, { Component } from 'react';

import logo from 'kowhub-logo.png';

export default class Header extends Component {

    render() {
        return (
            <div className="kb-header">
                <img src={logo} className="kowhub-logo" alt="logo" />
            </div>
        );
    }
}

