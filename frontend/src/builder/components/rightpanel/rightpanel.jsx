import React, { Component } from 'react';
import axios from 'axios';

import UserListHeader from './userlistheader';
import UserListUnits from './userlistunits';
import UtilitiesPanel from './utilitiespanel';

export default class RightPanel extends Component {
    /*
     * Receives as props:   activeList
     *                      handleRemoveUnit
     *                      handleMetaChange
     */
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    openListPdf = (e) => {
        e.preventDefault();
        /*
         * Note: this only returns a placeholder PDF for now
         * Preferable behavior: One click, one HTTP call to receive PDF, open new
         *          window with PDF
         * Problem: Browser prevents opening new window automatically, i.e. not as
         *          a direct result of a click. (Spam protection)
         * Potential solution 1: Download PDF instead of opening in new window.
         *          Prevents browser from blocking the automatic action.
         * Potential solution 2: ??
         */
        axios({
            method: 'post',
            url: 'pdf',
            responseType: 'arraybuffer',
            data: this.props.activeList
        }).then( response => {
            console.log("Received PDF!");
            if (false) {
                console.log(response.data);
                console.log(response.status);
                console.log(response.statusText);
                console.log(response.headers);
                console.log(response.config);
                console.log(response.request);
            }
            //window.open("data:application/pdf," + encodeURI(response.data), "_blank");
            //window.open(response.data);
            let blob = new File([response.data], "TEST", {type: 'application/pdf' });
            let url = window.URL.createObjectURL(blob);
            //window.open(url);
            //pdfwin.location.assign(url);
            let link = document.createElement('a');
            link.href = url;
            //link.href = "#";
            link.target="_blank";
            link.rel="noopener noreferrer";
            link.download = 'Trying.pdf';
            link.click();
        }).catch( error => {
            console.log("Request Error!");
            console.log(error);
        });
    }
    
    render() {
        return (
            <div className="kb-rightpanel">
                <UserListHeader
                    list={this.props.activeList}
                    handleMetaChange={this.props.handleMetaChange} />
                <UserListUnits
                    list={this.props.activeList}
                    handleRemoveUnit={this.props.handleRemoveUnit} />
                <UtilitiesPanel
                    openListPdf={this.openListPdf} />
            </div>
        );
    }
}

