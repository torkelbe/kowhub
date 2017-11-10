import React from 'react';
import { CSSTransition } from 'react-transition-group';

export default function TransitionItem({children, timeout, onExited, exitTrigger}) {
    return (
        <CSSTransition classNames="transition"
                       timeout={timeout ? timeout : 500}
                       in={!exitTrigger}
                       onExited={onExited}
                       mountOnEnter={true}
                       appear={true} >
            {children}
        </CSSTransition>
    );
}

