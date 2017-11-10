import React, { Component } from 'react';

const defaultName = "(no name)";

export default class UserListTitle extends Component {

    handleChange = (e) => {
        e.preventDefault();
        this.setState({ value: e.target.value });
        this.props.handleMetaChange({ name: e.target.value });
    }

    handleBlur = (e) => {
        e.preventDefault();
        if (e.target.value === "") {
            this.props.handleMetaChange({ name: defaultName });
        }
    }

    handleFocus = (e) => {
        e.preventDefault();
        if (e.target.value === defaultName) {
            e.target.value = "";
        }
    }

    render() {
        return (
            <input
                value={this.props.name}
                onChange={(e) => this.handleChange(e)}
                onBlur={(e) => this.handleBlur(e)}
                onFocus={(e) => this.handleFocus(e)}
                className="kb-userlistheader__title"
            />
        );
    }
}
