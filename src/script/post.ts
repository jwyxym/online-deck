import axios from 'axios';

interface postObject {
    page : number;
    keyWord : string;
    sortLike : boolean;
    sortRank : boolean;
    contributor : string;
}

interface listObject {
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
    user: User;
    token: string;
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

    signin = async (data : MyCardSigninObject) : Promise<MyCardObject> => {
        let response : {
            data : MyCardObject
        };
        try {
            response = await axios.post(`${this.url}/accounts/signin`, data);
            return response.data;
        }
        catch(error) {
            console.error(error);
            return {
                user : {
                    id : 0,
                    username : '',
                    email : '',
                    avatar : 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'
                },
                token : ''
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
        menu : Array<listObject>;
        total : number
    }>  => {
        let response : { data : { data : { records : Array<listObject>, total : number }}};
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
        let response : { data : { code : number }};
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
        menu : Array<listObject>;
        total : number
    }>  => {
        let response : { data : { data : { records : Array<listObject>, total : number }}};
        try {
            response = await axios.get(`${this.url}/api/mdpro3/sync/${userId}`, {
                headers: { 
                    'ReqSource': 'MDPro3',
                    'token': token
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

}

const onlineDecks = new OnlineDecks('https://zgai.tech:38443');
const MC = new MyCard('https://sapi.moecube.com');

export {
    postObject,
    listObject,
    onlineDecks,
    MyCardObject,
    MyCardSigninObject,
    MC
};