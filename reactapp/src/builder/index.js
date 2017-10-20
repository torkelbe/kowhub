import React from 'react';
import ReactDOM from 'react-dom';
import BuilderApp from './components/main'

require('./stylesheets/main.scss');

ReactDOM.render(
    <BuilderApp />,
    window.react_mount
);
