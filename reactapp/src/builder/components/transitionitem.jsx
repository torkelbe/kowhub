import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';

export default function TransitionItem({children, ...props}) {
    return (
        <CSSTransition {...props}
                       timeout={1000}
                       classNames="transitem">
            {children}
        </CSSTransition>
    );
}

