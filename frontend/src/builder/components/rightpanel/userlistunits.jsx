import React from 'react';

import UserListEntry from './userlistentry';

export default function UserListUnits({list, handleRemoveUnit}) {
    if (!list) return <div className="kb-userlistunits" /> ;
    const userListEntries = list.units.map(
        (unit, index) =>
            <UserListEntry
                key={unit.id}
                unitkey={unit.key}
                index={index}
            />
    );
    return (
        <div className="kb-userlistunits">
            {userListEntries}
        </div>
    );
}

