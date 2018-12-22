import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ITEMS, getPerks } from './data';

let destinyItems = [];

class DestinyItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            perksPopulated: false,
            primaryPerks: [],
            secondaryPerks: [],
            rating: null
        }
    }

    async componentDidMount() {
        await this.populatePerks();
    }

    async populatePerks() {
        let perks = await getPerks();
        if (this.props.item.type === "Hunter Cloak" ||
            this.props.item.type === "Warlock Bond" ||
            this.props.item.type === "Titan Mark") {
            if (this.props.item.perks[0] != null) {
                this.setState({
                    primaryPerks: this.props.item.perks[0].map(perkName => perks.get(perkName.toLowerCase()))
                });
            }
            if (this.props.item.perks[1] != null) {
                this.setState({
                    secondaryPerks: this.props.item.perks[1].map(perkName => perks.get(perkName.toLowerCase()))
                });
            }
        } else {
            if (this.props.item.perks[2] != null) {
                this.setState({
                    primaryPerks: this.props.item.perks[2].map(perkName => perks.get(perkName.toLowerCase()))
                });
            }
            if (this.props.item.perks[3] != null) {
                this.setState({
                    secondaryPerks: this.props.item.perks[3].map(perkName => perks.get(perkName.toLowerCase()))
                });
            }
        }
        this.setState({ perksPopulated: true });
        this.rateItem();
    }

    rateItem() {
        let badPrimaryPerks = this.state.primaryPerks.filter(perk => !perk.isGood);
        if (badPrimaryPerks.length === this.state.primaryPerks.length) {
            this.setState({ rating: 'bad' });
        } else if (badPrimaryPerks.length === this.state.primaryPerks.length - 1) {
            this.setState({ rating: 'ok'});
        } else {
            this.setState({ rating: 'good'});
        }
        this.props.parent.onItemRated(this.props.item.id, this.state.rating);
    }

    render() {
        let content;
        if (this.state.perksPopulated) {
            let perkCol1 = this.state.primaryPerks.map((perk) =>
            {
                if (perk == null) {
                    return <li>undefined</li>
                }
                return <li><div className={perk.isGood ? 'good' : 'bad'}>{perk.name}</div></li>;
            });
            let perkCol2 = this.state.secondaryPerks.map((perk) =>
            {
                if (perk == null) {
                    return <li>undefined</li>;
                }
                return <li><div className={perk.isGood ? 'good' : 'bad'}>{perk.name}</div></li>;
            });
            content = (
                <div>
                    <div className={this.state.rating}>{this.props.item.id} - {this.props.item.item} - {this.props.item.type} ({this.props.item.class})</div>
                    <div>
                        <p>Perk Column 1</p>
                        <ul>{perkCol1}</ul>
                        <p>Perk Column 2</p>
                        <ul>{perkCol2}</ul>
                    </div>
                    <br/>
                </div>
            );
        } else {
            content = (
                <div>
                    <div>{this.props.item.id} - {this.props.item.item} - {this.props.item.type} ({this.props.item.class})</div>
                </div>
            );
        }

        return content;
    }
}

class MainApp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            goodItems: [],
            badItems: []
        };
        getPerks();
        destinyItems = ITEMS.map(item =>
            <DestinyItem key={item.id} item={item} parent={this} />);
    }

    onItemRated(id, rating) {
        if (rating === 'good') {
            this.setState({ goodItems: this.state.goodItems.concat(id) });
        } else {
            this.setState({ badItems: this.state.badItems.concat(id) });
        }
    }

    render() {
        const items = destinyItems.map(item => {
            return (
                <li key={item.id}>
                    {item}
                </li>
            );
        });

        const goodItems = destinyItems.filter(item =>
            this.state.goodItems.includes(item.key))
            .map(item => {
                return (
                    <li key={item.key}>
                        {item}
                    </li>
                );
            }
        );

        const badItems = destinyItems.filter(item =>
            this.state.badItems.includes(item.key))
            .map(item => {
                return (
                    <li key={item.key}>
                        {item}
                    </li>
                );
            }
        );

        return (
            <div>
                <h1>Destiny Item Rater</h1>
                <div>
                    <h2>All Items:</h2>
                    <div className="scroll-container">
                        <ul>{items}</ul>
                    </div>
                </div>
                <div className="split-content-container">
                    <div className="list-container">
                        <h2>Good Items:</h2>
                        <div className="scroll-container">
                            <ul>{goodItems}</ul>
                        </div>
                    </div>
                    <div className="list-container">
                        <h2>Bad Items:</h2>
                        <div className="scroll-container">
                            <ul>{badItems}</ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <MainApp />,
    document.getElementById('root')
);