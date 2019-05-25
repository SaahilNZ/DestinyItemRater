import React, { createRef } from 'react';
import DestinyItemContainer, { buildItemContainer } from '../model/DestinyItemContainer';
import ItemStore from '../stores/ItemStore';
import TaggingService, { ItemTag } from '../services/TaggingService';
import { getWeaponPerkRatings } from '../model/WeaponPerkRating';

interface IdSearchStringPopupProps {
    closeSearch(): void;
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
        let { items, itemDefinitions, perkRatings, comparisons } = ItemStore.getState();
        let weaponPerkRatings = getWeaponPerkRatings();

        let containers = items
            .map(item => buildItemContainer(item, itemDefinitions, comparisons, perkRatings, weaponPerkRatings, new Map()));
        let itemTags = TaggingService.tagItems(containers);
        let taggedItems = items
            .map(item => buildItemContainer(item, itemDefinitions, comparisons, perkRatings, weaponPerkRatings, itemTags));
        let { junkSearchString, infuseSearchString } = this.generateIdSearchStrings(taggedItems);

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

    generateIdSearchStrings(taggedItems: DestinyItemContainer[]) {
        let junkItems: DestinyItemContainer[] = [];
        let infusionItems: DestinyItemContainer[] = [];
        taggedItems.forEach(taggedItem => {
            switch (taggedItem.tag) {
                case ItemTag.INFUSE:
                    infusionItems.push(taggedItem);
                    break;
                case ItemTag.JUNK:
                    junkItems.push(taggedItem);
                    break;
            }
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