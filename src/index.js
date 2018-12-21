import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DestinyPerk, { ITEMS, getPerks } from './data';

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
        getPerks();
    }

    render() {
        const items = ITEMS.map(item => {
            return (
                <li key={item.id}>
                    <DestinyItem item={item} />
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