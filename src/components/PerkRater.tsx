import React from "react";
import PerkRating from "../model/PerkRating";

interface PerkRaterProps {
    perkRatings: Map<string, PerkRating>;
    applyCallback: () => void;
}

interface PerkRaterState {
    perkRatings: Map<string, PerkRating>;
}

class PerkRater extends React.Component<PerkRaterProps, PerkRaterState> {
    constructor(props: PerkRaterProps) {
        super(props);
        this.apply = this.apply.bind(this);
        this.state = {
            perkRatings: new Map<string, PerkRating>()
        }

        this.handleRatingChanged = this.handleRatingChanged.bind(this);
        this.apply = this.apply.bind(this);
    }

    componentDidMount() {
        this.setState({
            perkRatings: this.props.perkRatings
        });
    }

    render() {
        let perkRatings = [];
        this.state.perkRatings.forEach((perkRating, perkName) => {
            let upgrades = perkRating.upgrades.map(upgrade =>
                <li key={upgrade}>{upgrade}</li>
            );
            perkRatings.push(
                <tr key={perkName}>
                    <td>
                        <input type="checkbox" checked={perkRating.isGoodByMode['PvE']}
                            name={`${perkName}__PvE`} onChange={this.handleRatingChanged} />
                    </td>
                    <td>
                        <input type="checkbox" checked={perkRating.isGoodByMode['PvP']}
                            name={`${perkName}__PvP`} onChange={this.handleRatingChanged} />
                    </td>
                    <td>{perkRating.name}</td>
                    <td>
                        <ul>
                            {upgrades}
                        </ul>
                    </td>
                </tr>
            );
        });
        return (
            <div>
                <table className="item-table">
                    <tbody>
                        <tr>
                            <th>Is Good in PvE?</th>
                            <th>Is Good in PvP?</th>
                            <th>Name</th>
                            <th>Upgrades</th>
                        </tr>
                        {perkRatings}
                    </tbody>
                </table>
                <br />
                <input type="button" value="Apply" onClick={this.apply} />
            </div>);
    }

    handleRatingChanged(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;

        const isGood = target.checked;
        const [perkName, mode] = target.name.split('__');

        let updatedRatings = this.state.perkRatings;
        let rating = updatedRatings.get(perkName);
        rating.isGoodByMode[mode] = isGood;
        updatedRatings.set(perkName, rating);

        this.setState({
            perkRatings: updatedRatings
        });
    }

    apply() {
        let perkRatings = {
            perks: Array<PerkRating>()
        };
        this.state.perkRatings.forEach((perkRating, perkName) => {
            perkRatings.perks.push(perkRating);
        });
        localStorage.setItem("perk_ratings", JSON.stringify(perkRatings));
        this.props.applyCallback();
    }
}

export default PerkRater;