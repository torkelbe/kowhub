import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';

export default function DropDownMenu(items, itemRender) {

    return class extends Component {
        /*
         * Receives as props:   activeItem
         *                      handleSelect
         */
        constructor(props) {
            super(props);
            this.state = {
                items: items,
                in: false,
            }
        }

        handleOpenMenu = () => {
            if (this.state.in) this.setState({in: false});
            else this.setState({in: true});
        }

        handleCloseMenu = () => {
            this.setState({in: false});
        }

        render() {
            const {timeout, activeItem} = this.props;
            const listOfItems = this.state.items.map( item => itemRender(item) );
            return (
                <div className="dropdownmenu">
                    <div onClick={this.handleOpenMenu} >
                        {itemRender(activeItem)}
                    </div>
                    <CSSTransition classnames="dropdown"
                                   timeout={timeout ? timeout : 500}
                                   in={this.state.in} >
                        <div onClick={this.handleCloseMenu} >
                            {listOfItems}
                        </div>
                    </CSSTransition>
                </div>
            );
        }
    }
}

