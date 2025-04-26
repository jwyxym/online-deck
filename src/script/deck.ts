import { reactive } from 'vue';
import { listObject } from './post';

interface DeckObject {
    title : string;
    content : Array<string>
}

class Deck {
    main : Array<string> = [];
    extra : Array<string> = [];
    side : Array<string> = [];
    id : string;
    name : string;
    content : string;
    clear = () : void => {
        this.main = [];
        this.extra = [];
        this.side = [];
        this.id = '';
        this.name = '';
        this.content = '';
    };
    read = async (deck : string, i : listObject) : Promise<void> => {
        this.content = deck;
        const mainDeck = deck.match(/#main\r?\n([\s\S]+?)\r?\n#extra/);
        const extraDeck = deck.match(/#extra\r?\n([\s\S]+?)\r?\n!side/);
        const sideDeck = deck.match(/!side\r?\n([\s\S]+?)\r?\n#/);
        this.main = mainDeck ? mainDeck[1].trim().split(/\r?\n/).map(String) : [];
        this.extra = extraDeck ? extraDeck[1].trim().split(/\r?\n/).map(String) : [];
        this.side = sideDeck ? sideDeck[1].trim().split(/\r?\n/).map(String) : [];
        this.id = i.deckId;
        this.name = i.deckName;
    };
    export = () : Array<DeckObject> => {
        return [
            reactive({
                title : '主卡组',
                content : this.main
            }),
            reactive({
                title : '额外卡组',
                content : this.extra
            }),
            reactive({
                title : '副卡组',
                content : this.side
            })
        ]
    };
    printBlob = () : Blob => {
        return new Blob([this.content], { type: 'application/ydk' });
    };
}

export {
    Deck,
    DeckObject
};