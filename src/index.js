import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import ItemsTable from './components/ItemsTable';

class MainApp extends React.Component {

    render() {
        return (
            <ItemsTable />
        );
    }
}

ReactDOM.render(
    <MainApp />,
    document.getElementById('root')
);