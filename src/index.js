import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ITEMS } from './data';

class MainApp extends React.Component {
    render() {
        const items = ITEMS.map(item => {
            return (
                <li key={item.id}>
                    {item.id} - {item.item}
                </li>
            );
        });

        return (
            <div>
                <h1>Destiny Item Rater</h1>
                <ul>{items}</ul>
            </div>
        );
    }
}

ReactDOM.render(
    <MainApp />,
    document.getElementById('root')
);