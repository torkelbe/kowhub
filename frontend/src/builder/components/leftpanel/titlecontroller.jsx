import React, { Component } from 'react';

const defaultName = "(no name)";

export default class TitleController extends Component {
    /*
     * Receives as props:   name
     *                      handleMetaChange
     */

    constructor(props) {
        super(props);
        this.state = {
            isLocked: true,
            isEditing: false,
        }
    }

    handleDoubleClick = (e) => {
        e.preventDefault();
        this.setState({isLocked: false, isEditing: false});
        if (e.target.value === defaultName) {
            e.target.value = "";
        }
    }

    handleChange = (e) => {
        e.preventDefault();
        this.setState({isEditing: true});
        this.props.handleMetaChange({ name: e.target.value });
    }

    handleBlur = (e) => {
        e.preventDefault();
        this.setState({isLocked: true});
        if (e.target.value === "") {
            this.props.handleMetaChange({ name: defaultName });
        }
    }

    handleKeyDown = (e) => {
        /* Blur input on 'Enter' (13) or 'Escape' (27) */
        if (e.keyCode == 13 || e.keyCode == 27) {
            e.preventDefault();
            this.textInput.blur();
        }
    }

    handleInputMount = (input) => {
        if (input) {
            this.textInput = input;
            input.focus();
            if (!this.state.isEditing) input.select();
            if (input.value === defaultName) {
                input.value = "";
            }
        }
    }

    render() {
        const { name } = this.props;
        if (this.state.isLocked) {
            return (
                <div onDoubleClick={(e) => this.handleDoubleClick(e) } >
                    {name}
                </div>
            );
        } else {
            return (
                <input
                    ref={input => this.handleInputMount(input)}
                    value={name}
                    onChange={(e) => this.handleChange(e)}
                    onBlur={(e) => this.handleBlur(e)}
                    onKeyDown={(e) => this.handleKeyDown(e)}
                />
            );
        }
    }
}
