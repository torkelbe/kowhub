import React, { Component } from 'react';
import { CSSTransition } from 'react-transition-group';

export default function TransitionItem({children, timeout, ...props}) {
    return (
        <CSSTransition {...props}
                       timeout={timeout}
                       classNames="transitem">
            {children}
        </CSSTransition>
    );
}

