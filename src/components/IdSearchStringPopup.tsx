import React, { createRef } from 'react';
import DestinyItemContainer, { buildItemContainer } from '../model/DestinyItemContainer';
import ItemComparisonResult from '../services/ItemComparisonResult';
import ItemStore from '../stores/ItemStore';

interface IdSearchStringPopupProps {
    closeSearch(): void;
    getMaxPowerByItemType(items: DestinyItemContainer[]): Map<string, Map<string, number>>;
    sortItemsByPower(items: DestinyItemContainer[]): Map<string, Map<string, DestinyItemContainer[]>>;
}

interface IdSearchStringPopupState {
    copyResult: string;
}

class IdSearchStringPopup extends React.Component<IdSearchStringPopupProps, IdSearchStringPopupState> {
    private junkSearchTextArea = createRef<HTMLTextAreaElement>();
    private infuseSearchTextArea = createRef<HTMLTextAreaElement>();

    constructor(props) {
        super(props);
        this.copySearch = this.copySearch.bind(this);
        this.generateIdSearchStrings = this.generateIdSearchStrings.bind(this);
        this.state = {
            copyResult: ""
        };
    }

    render() {
        let { junkSearchString, infuseSearchString } = this.generateIdSearchStrings();

        return (
            <div className="popup">
                <div className="popup-flex">
                    <div className="copy-panel">
                        <p>Junk items:</p>
                        <textarea ref={this.junkSearchTextArea} value={junkSearchString} />
                        <div className="popup-button-container">
                            <input className="popup-button" type="button" value="Copy" onClick={() => this.copySearch("junk")} />
                        </div>
                    </div>
                    <div className="copy-panel">
                        <p>Infusion items:</p>
                        <textarea ref={this.infuseSearchTextArea} value={infuseSearchString} />
                        <div className="popup-button-container">
                            <input className="popup-button" type="button" value="Copy" onClick={() => this.copySearch("infuse")} />
                        </div>
                    </div>
                </div>
                {this.state.copyResult}
                <div className="popup-button-container">
                    <input className="popup-button" type="button" value="Close" onClick={this.props.closeSearch} />
                </div>
            </div>
        );
    }

    generateIdSearchStrings() {
        let { items, itemDefinitions, comparisons, perkRatings } = ItemStore.getState();
        let containers = items.map(item => buildItemContainer(item, itemDefinitions, comparisons, perkRatings))
            .filter(container => container);

        let maxInfuseCount = 4;
        let maxPowers = this.props.getMaxPowerByItemType(containers);
        let badItems = containers.filter(container => {
            let isBetter = false;
            for (let i = 0; i < container.comparisons.length; i++) {
                const comparison = container.comparisons[i];
                if (comparison && comparison.result === ItemComparisonResult.ITEM_IS_BETTER) {
                    isBetter = true;
                    break;
                }
            }
            return isBetter;
        });

        let junkItems: DestinyItemContainer[] = [];
        let infusionItems: DestinyItemContainer[] = [];
        let sortedItems = this.props.sortItemsByPower(badItems);
        sortedItems.forEach((classMap, classType) => {
            classMap.forEach((slotItems, itemType) => {
                let maxPower = maxPowers.get(classType).get(itemType);
                let infuseCount = 0;
                for (var i = 0; i < slotItems.length; i++) {
                    var item = slotItems[i];
                    if (item.item.power === maxPower || infuseCount < maxInfuseCount) {
                        infusionItems.push(item);
                        infuseCount += 1;
                    } else {
                        junkItems.push(item);
                    }
                }
            });
        });

        return {
            junkSearchString: junkItems.map(item => `id:${item.item.id}`).join(" or "),
            infuseSearchString: infusionItems.map(item => `id:${item.item.id}`).join(" or "),
        };
    }

    copySearch(textArea: string) {
        if (textArea === "junk") {
            this.junkSearchTextArea.current.select();
            document.execCommand('copy');
            this.setState({
                copyResult: "Copied junk items"
            });
        } else if (textArea === "infuse") {
            this.infuseSearchTextArea.current.select();
            document.execCommand('copy');
            this.setState({
                copyResult: "Copied infusion items"
            });
        }
    }
}

export default IdSearchStringPopup;