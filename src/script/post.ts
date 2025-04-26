import axios from 'axios';
import Deck from './deck.ts';

interface postObject {
    page : number;
    keyWord : string;
    sortLike : boolean;
    sortRank : boolean;
    contributor : string;
}

interface DeckObject {
    deckCase : number;
    deckContributor : string;
    deckCoverCard1 : number;
    deckCoverCard2 : number;
    deckCoverCard3 : number;
    deckId : string;
    deckLike : number;
    deckName : string;
    deckProtector : number;
    lastDate: string;
    userId : number;
}

interface User {
    id : number;
    username : string;
    email : string;
    avatar : string;
}

interface MyCardObject {
    user : User;
    token : string;
}

interface MyCardSigninObject {
    account : string,
    password : string
}

class MyCard {
    url : string;

    constructor(url : string) {
        this.url = url;
    }

    signin = async (data : MyCardSigninObject, f : Function = () : void => { return; }) : Promise<MyCardObject> => {
        let response : {
            data : MyCardObject
        };
        try {
            response = await axios.post(`${this.url}/accounts/signin`, data);
            return response.data;
        }
        catch(error) {
            console.error(error);
            f(error);
            return {
                user : {
                    id : 0,
                    username : '',
                    email : '',
                    avatar : 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'
                },
                token : '',
            } as MyCardObject;
        }
    }
}

class OnlineDecks {
    url : string;

    constructor(url : string) {
        this.url = url;
    }

    getList = async (obj : postObject) : Promise<{
        menu : Array<DeckObject>;
        total : number
    }>  => {
        let response : { data : { data : { records : Array<DeckObject>, total : number}}};
        try {
            response = await axios.get(`${this.url}/api/mdpro3/deck/list`, {
                params: {
                    size: 20,
                    page: obj.page,
                    keyWord: obj.keyWord,
                    contributor: obj.contributor,
                    sortLike: obj.sortLike,
                    sortRank: obj.sortRank
                },
                headers: { 
                    'ReqSource': 'MDPro3'
                }
            });
            return {
                menu : response.data.data.records,
                total : response.data.data.total
            };
        } catch(error) {
            console.error(error);
            return {
                menu : [],
                total : 0
            };
        }
    };
    getDeck = async (deckId : string): Promise<string>  => {
        let response : { data : { data : { deckYdk : string}}};
        try {
            response = await axios.get(`${this.url}/api/mdpro3/deck/${deckId}`, {
                headers: { 
                    'ReqSource': 'MDPro3'
                }
            });
            return response.data.data.deckYdk;
        } catch(error) {
            console.error(error);
            return '';
        }
    };
    like = async (deckId : string): Promise<boolean>  => {
        let response : { data : { code : number}};
        try {
            response = await axios.post(`${this.url}/api/mdpro3/deck/like/${deckId}`, {}, {
                headers: { 
                    'ReqSource': 'MDPro3'
                }
            });
            return response.data.code == 0;
        } catch(error) {
            console.error(error);
            return false;
        }
    };
    getMyList = async (userId : number, token : string) : Promise<{
        menu : Array<DeckObject>;
        total : number
    }>  => {
        let response : { data : { data : Array<DeckObject>}};
        try {
            response = await axios.get(`${this.url}/api/mdpro3/sync/${userId}/nodel`, {
                headers: { 
                    'ReqSource': 'MDPro3',
                    'token': token
                }
            });
            console.log(response)
            return {
                menu : response.data.data,
                total : response.data.data.length
            };
        } catch(error) {
            console.error(error);
            return {
                menu : [],
                total : 0
            };
        }
    };
    upload = async (deck : Deck, i : MyCardObject, f : {
        success : Function,
        error : Function
    } = {
        success : () : void => { return; },
        error : () : void => { return; }
    }, isDelete : boolean = false) : Promise<string>  => {
        let response : { data : { data : Boolean}};
        try {
            const id : { data : { data : string; } } = deck.id.length > 0 ? { data : { data : deck.id } } : await axios.get(`${this.url}/api/mdpro3/deck/deckId`, {
                headers: { 
                    'ReqSource': 'MDPro3',
                }
            });
            if (!id.data.data)
                throw new Error('卡组id获取失败');

            const toDeck = (ydk : string) : string => {
                return `${ydk}##${id.data}\r\n###${i.user.id}`
            };

            response = await axios.post(`${this.url}/api/mdpro3/sync/single`, {
                deckContributor : i.user.username,
                userId : i.user.id,
                deck : {
                    deckId : id.data.data,
                    deckName : deck.name,
                    deckCoverCard1 :  deck.cover[0],
                    deckCoverCard2 :  deck.cover[1],
                    deckCoverCard3 :  deck.cover[2],
                    deckCase :  deck.case,
                    deckProtector :  deck.protector,
                    deckYdk : toDeck(deck.content),
                    isDelete : isDelete
                }
            }, {
                headers: { 
                    'ReqSource': 'MDPro3',
                    'token': i.token,
                }
            });
            console.log(response)
            if (!response.data.data)
                throw new Error('卡组上传失败');
            f.success(id.data.data);
            return id.data.data;
        } catch(error) {
            console.error(error);
            f.error(error);
            return '';
        }
    };

}

const onlineDecks = new OnlineDecks('https://zgai.tech:38443');
const MC = new MyCard('https://sapi.moecube.com');

export {
    postObject,
    DeckObject,
    onlineDecks,
    MyCardObject,
    MyCardSigninObject,
    MC
};