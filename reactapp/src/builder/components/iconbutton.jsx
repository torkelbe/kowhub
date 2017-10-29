import React from 'react';

import NewIcon from 'svg/temp/new-icon.svg';
import DeleteIcon from 'svg/temp/delete-icon.svg';

const buttonType = {
    new: NewIcon,
    delete: DeleteIcon,
}

export default function IconButton(props) {
    const Svg = buttonType[props.type];
    return (
        <div className="kb-icon-button" onClick={(e) => props.onClick(e)} >
            <Svg />
        </div>
    );
}

