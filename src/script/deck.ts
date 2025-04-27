import { reactive } from 'vue';
import { DeckObject } from './post.ts';

class Deck {
    main : Array<number> = [];
    extra : Array<number> = [];
    side : Array<number> = [];
    id : string = '';
    name : string = '';
    content : string = '';
    contributor : string = '';
    user : number = 0;
    case : number = 0;
    protector : number = 0;
    cover : Array<number> = [0, 0, 0];
    public : boolean = false;

    clear = () : void => {
        this.main = [];
        this.extra = [];
        this.side = [];
        this.id = '';
        this.name = '';
        this.content = '';
        this.contributor = '';
        this.user = 0;
        this.case = 0;
        this.protector = 0;
        this.cover = [0, 0, 0];
        this.public = false;
    };
    read = async (deck : string, i : DeckObject) : Promise<void> => {
        this.content = deck.replace(/^#{2,3}.*$\r?\n?/gm, '');
        const mainDeck = deck.match(/#main\r?\n([\s\S]+?)\r?\n#extra/);
        const extraDeck = deck.match(/#extra\r?\n([\s\S]+?)\r?\n!side/);
        const sideDeck = deck.match(/!side\r?\n([\s\S]+?)\r?\n#/);
        this.main = mainDeck ? mainDeck[1].trim().split(/\r?\n/).map(Number).filter(id => !isNaN(id)) : [];
        this.extra = extraDeck ? extraDeck[1].trim().split(/\r?\n/).map(Number).filter(id => !isNaN(id)) : [];
        this.side = sideDeck ? sideDeck[1].trim().split(/\r?\n/).map(Number).filter(id => !isNaN(id)) : [];
        this.id = i.deckId;
        this.name = i.deckName;
        this.contributor = i.deckContributor;
        this.user = i.userId;
        this.case = i.deckCase?? 0;
        this.protector = i.deckProtector?? 0;
        this.cover = [i.deckCoverCard1?? 0, i.deckCoverCard2?? 0, i.deckCoverCard3?? 0];
        this.public = i.public ?? false;
    };
    export = () : Array<{
        title : string;
        content : Array<number>
    }> => {
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

export default Deck;