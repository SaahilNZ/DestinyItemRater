import React from 'react';
import ItemsTable from './ItemsTable.jsx';

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showAllItems: true,
            showBadItems: false
        }
        this.showAllItems = this.showAllItems.bind(this);
        this.showBadItems = this.showBadItems.bind(this);
    }

    showAllItems() {
        this.setState({
            showAllItems: true,
            showBadItems: false
        });
    }

    showBadItems() {
        this.setState({
            showAllItems: false,
            showBadItems: true
        });
    }

    render() {
        return (
            <div>
                <div className="tab">
                    <input className={"tab-link " + (this.state.showAllItems ? "tab-link-active" : "")}
                        type="button" value="All Items" onClick={this.showAllItems} />
                    <input className={"tab-link " + (this.state.showBadItems ? "tab-link-active" : "")}
                        type="button" value="Bad Items" onClick={this.showBadItems} />
                </div>
                <div className={this.state.showAllItems ? "" : "hidden"}>
                    <ItemsTable />
                </div>
                <div className={this.state.showBadItems ? "" : "hidden"}>
                    <ItemsTable itemFilter="bad" />
                </div>
            </div>
        );
    }
}

export default MainApp;