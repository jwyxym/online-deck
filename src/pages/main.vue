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
                    :avatar-circle = true
                    :title = "Mycard.user?.username ?? ''"
                    :note = "Mycard.user?.email ?? ''"
                    :clickable = true
                    :time = "(Mycard.user?.id ?? 0) <= 0 ? '登陆萌卡' : ''"
                    :avatar = "Mycard.user?.avatar ?? 'https://cdn02.moecube.com:444/accounts/default_avatar.jpg'"
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
        <view id = 'list' v-if = 'menu.data.length > 0'>
            <transition name = 'switch'>
                <uni-pagination :current = 'menu.search_info.page' v-model = 'menu.search_info.page' pageSize = 20 :total = 'menu.total' @change = 'search.on' v-show = 'page.menu && !search.isLoading()'></uni-pagination>
            </transition>
            <transition name = 'switch'>
                <uni-list id = 'uni-list' v-show = '!search.isLoading() && page.menu'>
                    <uni-list-item
                        v-for = '(i, v) in menu.data'
                        :title = 'i.name'
                        :note = 'i.contributor'
                        class = 'uni-list-item'
                        :clickable = true
                        @click = 'deck.on(i, v)'
                    >
                        <template v-slot:header>
                            <image
                                :src = '`https://images.ygoprodeck.com/images/cards_cropped/${i.cover[0]}.jpg`'
                                :style = "{ '--size' : `${size}px` }"
                            ></image>
                            <view style = 'width: 2%;'></view>
                        </template>
                        <template v-slot:footer>
                            <view class = 'footer'>
                                <span>{{ i.date }}</span>
                                <view>
                                    <span>{{ i.like }}</span>
                                    <uni-icons type = 'hand-up'></uni-icons>
                                </view>
                            </view>
                        </template>
                    </uni-list-item>
                </uni-list>
            </transition>
        </view>
        <transition name = 'switch'>
            <view id = 'deck' v-if = 'page.deck && menu.selected > -1'>
                <uni-card id = 'deck_head' is-full :title = "menu.data[menu.selected].name + '\n' + '上传者：' + menu.data[menu.selected].contributor">
                    <button size = 'mini' @click = 'deck.download()'>
                        <uni-icons type = 'download'></uni-icons>
                    </button>
                    <button size = 'mini' @click = 'deck.like.on()' v-show = 'menu.data[menu.selected].user > 0'>
                        <uni-icons :type = 'deck.like.icon'></uni-icons>
                    </button>
                    <button size = 'mini' @click = 'deck.save()' v-show = 'menu.data[menu.selected].user == Mycard.user?.id'>
                        <uni-icons :type = "deck.chk.save ? 'spinner-cycle' : 'cloud-upload'"></uni-icons>
                    </button>
                    <button size = 'mini' @click = 'deck.del()' v-show = 'menu.data[menu.selected].user == Mycard.user?.id && menu.data[menu.selected].id.length > 0'>
                        <uni-icons :type = "deck.chk.save ? 'spinner-cycle' : 'trash'"></uni-icons>
                    </button>
                    <button size = 'mini' @click = 'deck.public()' v-show = 'menu.data[menu.selected].user == Mycard.user?.id && menu.data[menu.selected].id.length > 0'>
                        <uni-icons :type = "deck.chk.save ? 'spinner-cycle' : 'eye'" v-show = 'menu.data[menu.selected].public'></uni-icons>
                        <uni-icons :type = "deck.chk.save ? 'spinner-cycle' : 'eye-slash'" v-show = '!menu.data[menu.selected].public'></uni-icons>
                    </button>
                    <br>
                    <button size = 'mini' @click = 'deck.update()' v-show = 'menu.data[menu.selected].user == Mycard.user?.id'>
                        选择文件覆盖
                    </button>
                </uni-card>
                <uni-card class = 'deck_body' is-full v-for = 'i in menu.data[menu.selected].export()' :title = '`${i.title} : ${i.content.length}`' v-show = '!deck.chk.reload'>
                    <image class = 'deck_cards' v-for = '(j, k) in i.content' :src = 'Math.floor(Math.log10(Math.abs(j))) < 8 ? `https://cdn.233.momobako.com/ygopro/pics/${j}.jpg!half` : `https://cdn02.moecube.com:444/ygopro-super-pre/data/pics/${j}.jpg`' mode = 'aspectFit' @error = 'changeImg(i, k)'></image>
                </uni-card>
            </view>
        </transition>
        <transition name = 'switch'>
            <uni-card id = 'form' v-if = 'page.form'>
                <view v-show = '(Mycard.user?.id ?? 0) > 0'>
                    <uni-card :title = 'Mycard.user?.username'>{{ Mycard.user?.email }}</uni-card>
                    <uni-card class = 'button' @click = 'search.mydecks'>我的卡组</uni-card>
                    <uni-card class = 'button' @click = 'deck.upload'>上传卡组</uni-card>
                    <view id = 'submit'>
                        <button size = 'mini' @click = 'Mycard.logout'>退出</button>
                        <button size = 'mini' @click = 'mc.form.off'>关闭</button>
                    </view>
                </view>
            </uni-card>
        </transition>
    </view>
</template>
<script setup lang = 'ts'>
    import { ref, reactive, watch, onMounted } from 'vue';
    import { onlineDecks, postObject, DeckObject } from '../script/post.ts';
    import Deck from '../script/deck.ts';
    import Uniapp from '../script/uniapp.ts';
    import Download from '../script/download.js';
    import Mycard from '../script/mycard.ts';

    const mc = reactive({
        form : {
            cache : '',
            on : async() : Promise<void> => {
                if (!Mycard.user) {
                    Mycard.login();
                    return;
                }
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

    const menu = reactive({
        data : [] as Array<Deck>,
        selected : -1,
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

    const search = reactive({
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
            search.caches.keyWord = menu.search_info.keyWord;
            search.caches.contributor = menu.search_info.contributor;
            const i = await onlineDecks.getList(menu.search_info);
            menu.data = i.menu;
            menu.total = i.total;
            search.reset();
        },
        mydecks : async() : Promise<void> => {
            if (search.isLoading() || Mycard.user!.id == 0) return;
            search.loading();
            const i = await onlineDecks.getMyList(Mycard.user!.id, Mycard.user!.token);
            menu.data = i.menu;
            menu.total = i.total;
            search.reset();
            mc.form.cache = 'page.menu';
            await mc.form.off();
        },
        caches : {
            keyWord : '',
            contributor : ''
        }
    });

    const page = reactive({
        menu : true,
        deck : false,
        form : false
    });

    const deck = reactive({
        chk : {
            save : false,
            reload : false,
            eye : true
        },
        pattern: {
            buttonColor: '#ecf5ff',
            iconColor: '#409eff',
            icon : 'closeempty'
        },
        on : async (i : Deck, v : number) : Promise<void> => {
            if (!page.menu) return;
            page.menu = false;
            if (i.content.length == 0) {
                const response = await onlineDecks.getDeck(i.id);
                i.read(response);
            }
            menu.selected = v;
            await (new Promise(resolve => setTimeout(resolve, 500)));
            page.deck = true;
        },
        off : async () : Promise<void> => {
            if (!page.deck) return;
            page.deck = false;
            menu.selected = -1;
            await (new Promise(resolve => setTimeout(resolve, 500)));
            page.menu = true;
        },
        upload : async () : Promise<void> => {
            if (!Mycard.user) return;
            await Uniapp.selectFile('ydk', async (res : UniApp.ChooseFileSuccessCallbackResult) => {
                const i = await onlineDecks.getMyList(Mycard.user!.id, Mycard.user!.token);
                menu.data = i.menu;
                menu.total = i.total;
                const name : string = res.tempFiles[0].name.split('.')[0];
                const content : string = await Uniapp.readFile(res.tempFiles[0]);
                menu.selected = menu.data.length;
                menu.data.push(new Deck({
                    deckId : '',
                    deckName : name,
                    userId : Mycard.user!.id,
                    deckContributor : Mycard.user!.username
                } as DeckObject));
                menu.data[menu.selected].read(content);
                mc.form.cache = 'page.deck';
                mc.form.off();
                uni.showModal({
                    title : '已覆盖新的卡组',
                    content : '需要点击上传才能保存到云端哦',
                    showCancel : false
                })
            });
        },
        update : async () : Promise<void> => {
            if (!Mycard.user) return;
            await Uniapp.selectFile('ydk', async (res : UniApp.ChooseFileSuccessCallbackResult) => {
                const content : string = await Uniapp.readFile(res.tempFiles[0]);
                deck.chk.reload = true;
                uni.showModal({
                    title : '已覆盖新的卡组',
                    content : '需要点击上传才能保存到云端哦',
                    showCancel : false
                })
                menu.data[menu.selected].read(content);
                deck.chk.reload = false;
            });
        },
        save : async () : Promise<void> => {
            if (deck.chk.save || !Mycard.user) return;
            deck.chk.save = true;
            await onlineDecks.upload(menu.data[menu.selected], {
                error : (error : { message : string}) :void => {
                    uni.showModal({
                        title : '上传卡组失败',
                        content : error.message,
                        showCancel : false
                    })
                },
                success : async (id : string) : Promise<void> => {
                    page.deck = false;
                    await (new Promise(resolve => setTimeout(resolve, 500)));
                    await search.mydecks();
                    if (!menu.data.some(i => i.id == id))
                        menu.data.push(new Deck({
                            deckCase : menu.data[menu.selected].case,
                            deckContributor : menu.data[menu.selected].contributor,
                            deckCoverCard1 : menu.data[menu.selected].cover[0],
                            deckCoverCard2 : menu.data[menu.selected].cover[1],
                            deckCoverCard3 : menu.data[menu.selected].cover[2],
                            deckId : menu.data[menu.selected].id,
                            deckLike : 0,
                            deckName : menu.data[menu.selected].name,
                            deckProtector : menu.data[menu.selected].protector,
                            lastDate: getCurrentDate(),
                            userId : mc.get.user.id,
                        }))
                    deck.chk.save = false;
                },
            })
        },
        del : () : void => {
            if (deck.chk.save || !Mycard.user) return;
            uni.showModal({
                title : '确认要删除吗？',
                success : async (res : { confirm : boolean; }) => {
                    if (res.confirm) {
                        deck.chk.save = true;
                        await onlineDecks.upload(menu.data[menu.selected], {
                            error : (error : { message : string}) : void => {
                                uni.showModal({
                                    title : '删除卡组失败',
                                    content : error.message,
                                    showCancel : false
                                })
                            },
                            success : async (id : string) : Promise<void> => {
                                page.deck = false;
                                menu.data.splice(menu.selected, 1);
                                menu.selected = 0;
                                await (new Promise(resolve => setTimeout(resolve, 500)));
                                await search.mydecks();
                                const index : number = menu.data.findIndex(i => i.id == id)
                                if (index > -1) {
                                    menu.data.splice(index, 1);
                                }
                                deck.chk.save = false;
                            },
                        }
                        , true)
                    }
                }
            })
        },
        public : async () : Promise<void> => {
            if (deck.chk.save || !Mycard.user) return;
            deck.chk.save = true;
            await onlineDecks.public(menu.data[menu.selected].public, Mycard.user!.id, menu.data[menu.selected].id, mc.get.token, {
                error : (error : { message : string}) : void => {
                    uni.showModal({
                        title : menu.data[menu.selected].public ? '隐藏卡组失败' : '公开卡组失败',
                        content : error.message,
                        showCancel : false
                    })
                },
                success : (pub : boolean) : void => {
                    menu.data[menu.selected].public = pub;
                    deck.chk.save = false;
                },
            })
        },
        download : async () : Promise<void> => {
            await Download.start(menu.data[menu.selected].printBlob(), menu.data[menu.selected].name);
        },
        like : {
            icon : 'hand-up',
            on : async () : Promise<void> => {
                if (await onlineDecks.like(menu.data[menu.selected].id)) {
                    deck.like.icon = 'hand-up-filled';
                    setTimeout(() => {
                        deck.like.icon = 'hand-up';
                    }, 10 * 60 * 1000);
                }
            }
        }
    });

    const changeImg = (i : {
        title : string;
        content : Array<number>
    }, v : number) => {
        i.content[v] = 0;
    }

    const getCurrentDate = () : string => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const size = ref(0);

    watch(() : number => { return menu.select.chk }, (n) : void => {
        menu.search_info.sortLike = n == 1;
        menu.search_info.sortRank = n == 2;
    });

    onMounted(() => {
        size.value = uni.getSystemInfoSync().windowWidth > uni.getSystemInfoSync().windowHeight ? uni.getSystemInfoSync().windowHeight / 14 : uni.getSystemInfoSync().windowHeight / 8;
        search.on();
    })
 
</script>
<style scoped lang = 'scss'>
    @import '@/uni_modules/uni-scss/index.scss';
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