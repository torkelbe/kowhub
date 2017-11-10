import React from 'react';

import data from 'source-data-api';

export default function UserListEntry({unitkey, index, handleRemoveUnit}) {
    /*
     *  Example return object from source-data-api
     *
     *  unit = {
     *      points: 140,
     *      name: "Palace Guard",
     *      type: "Infantry",
     *      form: "Regiment",
     *      stats: {"Me": "4+", "Ra": "-", ...etc },
     *      special: ["crs:1", "ind"],
     *      ranged: ["lbo:2"],
     *      options: ["Extra spell: Lightning Bolt (2)", "Helm of the Ram"]
     *  }
     */
    const unit = data.getUnit(unitkey);

    return (
        <div className="kb-userlistunits__unit">
            {unit.name + "  " + unit.form}
        </div>
    );
}

