import React from 'react';
import { CSSTransition } from 'react-transition-group';

export default function TransitionItem({children, timeout, handleExited, ...props}) {
    return (
        <CSSTransition {...props}
                       classNames="transition"
                       timeout={timeout ? timeout : 500}
                       in={props.in === false ? false : true}
                       onExited={handleExited}
                       mountOnEnter={true}
                       appear={true} >
            {children}
        </CSSTransition>
    );
}

