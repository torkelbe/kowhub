import React from 'react';

import NewIcon from 'svg/temp/new-icon.svg';
import DeleteIcon from 'svg/temp/delete-icon.svg';
import PrintIcon from 'svg/temp/print-icon.svg';
import InfoIcon from 'svg/temp/info-icon.svg';
import SettingsIcon from 'svg/temp/settings-icon.svg';

const buttonType = {
    new: NewIcon,
    delete: DeleteIcon,
    print: PrintIcon,
    info: InfoIcon,
    settings: SettingsIcon,
}

export default function IconButton({type, onClick}) {
    const Svg = buttonType[type];
    return (
        <div className="kb-icon-button" onClick={(e) => onClick(e)} >
            <Svg />
        </div>
    );
}

