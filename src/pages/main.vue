<template>
    <view id = 'page'>
        <uni-card is-full id = 'head'>
            <uni-card>
                <uni-search-bar
                    placeholder = '卡组名'
                    textColor = '#409eff'
                    bgColor = '#ecf5ff'
                    cancelButton = 'none'
                    v-model = 'menu.search_info.keyWord'>
                </uni-search-bar>
                <uni-search-bar
                    placeholder = '上传者'
                    textColor = '#409eff'
                    bgColor = '#ecf5ff'
                    cancelButton = 'none'
                    v-model = 'menu.search_info.contributor'>
                </uni-search-bar>
            </uni-card>
            <uni-card>
                <uni-data-checkbox v-model = 'menu.select.chk' :localdata = 'menu.select.data' :multiple = 'false'></uni-data-checkbox>
            </uni-card>
            <uni-list id = 'lognin'>
                <uni-list-chat
                avatar-circle = true
                :title = 'mc.get.user.username'
                :note = 'mc.get.user.email'
                clickable = true
                :time = "mc.get.user.id <= 0 ? '登陆萌卡' : ''"
                :avatar = 'mc.get.user.avatar'
                @click = 'mc.form.on()'
                >
                </uni-list-chat>
            </uni-list>
        </uni-card>
        <transition name = 'switch'>
            <uni-fab :pattern = 'search.pattern' @fabClick = 'search.on()' v-show = 'page.menu'/>
        </transition>
        <transition name = 'switch'>
            <uni-fab :pattern = 'deck.pattern' @fabClick = 'deck.off()' v-show = 'page.deck'/>
        </transition>
        <view id = 'list'>
            <transition name = 'switch'>
                <uni-pagination :current = 'menu.search_info.page' v-model = 'menu.search_info.page' pageSize = 20 :total = 'menu.total' @change = 'search.on' v-show = 'page.menu && !search.isLoading()'></uni-pagination>
            </transition>
            <transition name = 'switch'>
                <uni-list id = 'uni-list' v-show = 'menu.data.length > 0 && !search.isLoading() && page.menu'>
                    <uni-list-item
                        v-for = '(i, v) in menu.data'
                        :title = 'i.deckName'
                        :note = 'i.deckContributor'
                        class = 'uni-list-item'
                        clickable = true
                        @click = 'deck.on(i)'
                    >
                        <template v-slot:header>
                            <image
                                :src = '`https://images.ygoprodeck.com/images/cards_cropped/${i.deckCoverCard1}.jpg`'
                                :style = "{ '--size' : `${size}px` }"
                            ></image>
                        </template>
                        <template v-slot:footer>
                            <view class = 'footer'>
                                <span>{{ i.lastDate }}</span>
                                <view>
                                    <span>{{ i.deckLike }}</span>
                                    <uni-icons type = 'hand-up'></uni-icons>
                                </view>
                            </view>
                        </template>
                    </uni-list-item>
                </uni-list>
            </transition>
        </view>
        <transition name = 'switch'>
            <view id = 'deck' v-show = 'page.deck'>
                <uni-card id = 'deck_head' is-full :title = 'deck.app.name'>
                    <button size = 'mini' @click = 'deck.download()'>
                        <uni-icons type = 'download'></uni-icons>
                    </button>
                    <button size = 'mini' @click = 'deck.like.on()'>
                        <uni-icons :type = 'deck.like.icon'></uni-icons>
                    </button>
                </uni-card>
                <uni-card class = 'deck_body' is-full v-for = 'i in deck.app.export()' :title = '`${i.title} : ${i.content.length}`'>
                    <image class = 'deck_cards' v-for = '(j, k) in i.content' :src = '`https://cdn.233.momobako.com/ygopro/pics/${j}.jpg!half`' mode = 'aspectFit' @error = 'changeImg(i, k)'></image>
                </uni-card>
            </view>
        </transition>
        <transition name = 'switch'>
            <uni-card id = 'form' v-if = 'page.form'>
                <uni-forms :modelValue = 'mc.signin_info' v-show = 'mc.get.user.id <= 0'>
                    <uni-forms-item label = '账号'>
                        <uni-easyinput type = 'text' v-model = 'mc.signin_info.account' placeholder = '请输入账号' />
                    </uni-forms-item>
                    <uni-forms-item label = '密码'>
                        <uni-easyinput type = 'password' v-model = 'mc.signin_info.password' placeholder = '请输入密码' />
                    </uni-forms-item>
                    <view id = 'submit'>
                        <button size = 'mini' @click = 'mc.signin()'>登陆</button>
                        <button size = 'mini' @click = 'mc.form.off()'>关闭</button>
                    </view>
                </uni-forms>
                <view v-show = 'mc.get.user.id > 0'>
                    <uni-card :title = 'mc.get.user.username'>{{ mc.get.user.email }}</uni-card>
                    <uni-card class = 'button' @click = 'search.mydecks()'>我的卡组</uni-card>
                    <view id = 'submit'>
                        <button size = 'mini' @click = 'mc.signout()'>退出</button>
                        <button size = 'mini' @click = 'mc.form.off()'>关闭</button>
                    </view>
                </view>
            </uni-card>
        </transition>
    </view>
</template>
<script setup lang = 'ts'>
    import { ref, reactive, watch, onMounted } from 'vue';
    import { onlineDecks, postObject, listObject, MC, MyCardObject, MyCardSigninObject } from '../script/post.ts';
    import { Deck, DeckObject } from '../script/deck.ts';
    import Download from '../script/download.js';

    let mc = reactive({
        chk : false,
        signin : async () : Promise<void> => {
            if (mc.chk) return;
            mc.chk = true;
            if (mc.signin_info.account.length <= 0 || mc.signin_info.password.length <= 0) return;
            mc.get = await MC.signin(mc.signin_info);
            mc.chk = false;
        },
        signout  : async () : Promise<void> => {
            mc.get = {
                user : {
                    id : 0,
                    username : '',
                    email : '',
                    avatar : 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'
                },
                token : ''
            } as MyCardObject;
            await mc.form.off();
        },
        signin_info : {
            account : '',
            password : ''
        } as MyCardSigninObject,
        get : {
            user : {
                id : 0,
                username : '',
                email : '',
                avatar : 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'
            },
            token : ''
        } as MyCardObject,
        clear : () : void => {
            mc.get = {
                user : {
                    username : '',
                    email : '',
                    avatar : 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'
                }
            } as MyCardObject;
        },
        form : {
            cache : '',
            on : async() : Promise<void> => {
                mc.form.cache = (page.menu ? 'page.menu' : 'page.deck');
                page.menu = false;
                page.deck = false;
                await (new Promise(resolve => setTimeout(resolve, 500)));
                page.form = true;
            },
            off : async() : Promise<void> => {
                page.form = false;
                await (new Promise(resolve => setTimeout(resolve, 500)));
                switch (mc.form.cache) {
                    case 'page.menu':
                        page.menu = true;
                        break;
                    case 'page.deck':
                        page.deck = true;
                        break;
                }
                mc.form.cache = '';
            }
        }
    });

    let menu = reactive({
        data : [] as Array<listObject>,
        favourite : async () : Promise<void> => {
        },
        select : {
            data : [{
                text: '无排序',
                value: 0
            }, {
                text: '按点赞数量排序',
                value: 1
            }, {
                text: '按流行程度排序',
                value: 2
            }],
            chk : 0
        },
        search_info : {
            page : 1,
            keyWord : '',
            sortLike : false,
            sortRank : false,
            contributor : '',
        } as postObject,
        total : 0 as number
    });

    let search = reactive({
        pattern: {
            buttonColor: '#ecf5ff',
            iconColor: '#409eff',
            icon : 'search'
        },
        button : 'search' as string,
        loading : () : void => {
            search.pattern.icon = 'spinner-cycle';
        },
        reset : () : void => {
            search.pattern.icon = 'search';
        },
        isLoading : () : boolean => {
            return search.pattern.icon == 'spinner-cycle';
        },
        on : async() : Promise<void> => {
            if (search.isLoading()) return;
            search.loading();
            if (search.caches.keyWord != menu.search_info.keyWord || search.caches.contributor != menu.search_info.contributor) {
                menu.search_info.page = 1;
            }
            search.caches.keyWord = structuredClone(menu.search_info.keyWord);
            search.caches.contributor = structuredClone(menu.search_info.contributor)
            const i = await onlineDecks.getList(menu.search_info);
            menu.data = i.menu;
            menu.total = i.total;
            search.reset();
        },
        mydecks : async() : Promise<void> => {
            if (search.isLoading()) return;
            search.loading();
            const i = await onlineDecks.getMyList(mc.get.user.id, mc.get.token);
            menu.data = i.menu;
            menu.total = i.total;
            search.reset();
            await mc.form.off();
        },
        caches : {
            keyWord : '',
            contributor : ''
        }
    });

    let page = reactive({
        menu : true,
        deck : false,
        form : false
    });

    let deck = reactive({
        chking : false,
        app : new Deck(),
        pattern: {
            buttonColor: '#ecf5ff',
            iconColor: '#409eff',
            icon : 'closeempty'
        },
        on : async (i : listObject) : Promise<void> => {
            if (!page.menu) return;
            page.menu = false;
            const response = await onlineDecks.getDeck(i.deckId);
            await deck.app.read(response, i);
            await (new Promise(resolve => setTimeout(resolve, 500)));
            page.deck = true;
        },
        off : async () : Promise<void> => {
            if (!page.deck) return;
            page.deck = false;
            deck.app.clear();
            await (new Promise(resolve => setTimeout(resolve, 500)));
            page.menu = true;
        },
        download : async () : Promise<void> => {
            await Download.start(deck.app.printBlob(), deck.app.name);
        },
        like : {
            icon : 'hand-up',
            on : async () : Promise<void> => {
                if (await onlineDecks.like(deck.app.id)) {
                    deck.like.icon = 'hand-up-filled';
                    setTimeout(() => {
                        deck.like.icon = 'hand-up';
                    }, 10 * 60 * 1000);
                }
            }
        }
    });

    const changeImg = (i : DeckObject, v : number) => {
        i.content[v] = '0';
    }

    let size = ref(0);

    watch(() : number => { return menu.select.chk }, (n) : void => {
        menu.search_info.sortLike = n == 1;
        menu.search_info.sortRank = n == 2;
    });

    onMounted(() => {
        search.on();
        size.value = uni.getSystemInfoSync().windowHeight / 8;
    })
 
</script>
<style scoped lang = 'scss'>
    @import '../style/page.scss';

    .switch-enter-active,
    .switch-leave-active {
        transition: opacity 0.5s ease;
    }

    .switch-enter-from,
    .switch-leave-to {
        opacity: 0;
    }

    .switch-enter-to,
    .switch-leave-from {
        opacity: 1;
    }
</style>