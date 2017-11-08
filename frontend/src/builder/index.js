import React from 'react';
import ReactDOM from 'react-dom';
import BuilderApp from './components/builderapp'

require('./stylesheets/main.scss');

ReactDOM.render(
    <BuilderApp />,
    window.react_mount
);
