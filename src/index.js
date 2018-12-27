import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ItemsTable from './components/ItemsTable';

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
                    <input className="tab-link" type="button" value="All Items" onClick={this.showAllItems} />
                    <input className="tab-link" type="button" value="Bad Items" onClick={this.showBadItems} />
                </div>
                { this.state.showAllItems ? <ItemsTable /> : null}
                { this.state.showBadItems ? <ItemsTable itemFilter="bad"/> : null }
            </div>
        );
    }
}

ReactDOM.render(
    <MainApp />,
    document.getElementById('root')
);