<template>
    <div>
        <!-- ================== NAV BAR ============== -->
        <v-app-bar id="navbar" height="48" app elevation="0" color="#ffffff">
            <v-app-bar-nav-icon
                v-if="$vuetify.breakpoint.mdAndDown"
                @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
            <v-col cols="9" sm="5" md="4" lg="4" xl="5" class="pl-0 d-inline-flex">
                <v-text-field
                    label="Search..."
                    placeholder="Search..."
                    v-model="search"
                    solo
                    dense
                    flat
                    background-color="#e8e8e8d6"
                    prepend-inner-icon="mdi-magnify"
                    :hide-details="true"
                    clearable
                    @click:clear="clearSearch"
                    @mouseup.middle="onClickMouseMiddle(search)"
                    @keyup.enter="redirectToUpdateSearch()"></v-text-field>
                <v-btn icon small @click="toggleKeepSearch" class="mt-1 ml-1" title="keep / disable your search">
                    <v-icon class="pt-1">
                        {{ keepSearch ? 'mdi-pin' : 'mdi-pin-off' }}
                    </v-icon>
                </v-btn>
            </v-col>
            <v-col cols="12" sm="3" md="4" lg="3" xl="4" class="d-flex justify-end">
                <div v-if="this.$route.name === 'ViewInventory'" class="pt-2 rounded select-inventory-mode">
                    <v-checkbox
                        v-for="(mode, modeIndex) in inventoryModes"
                        :key="modeIndex"
                        v-model="storeInventoryMode"
                        :label="mode"
                        :value="mode"
                        hide-details=""
                        :ripple="false"
                        tile
                        class="px-3 font-weight-light"></v-checkbox>
                </div>
            </v-col>

            <v-col cols="12" sm="3" md="3" lg="4" xl="2" class="d-flex">
                <v-autocomplete
                    class="select-entity-menu"
                    :items="storeEntities"
                    v-model="selectedEntity"
                    label="Select Entity"
                    placeholder="Select Entity"
                    solo
                    dense
                    hide-details=""
                    flat
                    background-color="#e8e8e8d6"
                    prepend-inner-icon="mdi-server-network"></v-autocomplete>
                <v-btn icon small @click="setSavedQueries('bookmarks')" class="mt-1 ml-1" title="Add to Favorites">
                    <v-icon> mdi-bookmark </v-icon>
                </v-btn>
            </v-col>

            <v-spacer></v-spacer>
            <v-col cols="1" sm="1" md="1" lg="1" xl="1" class="d-flex justify-end">
                <v-menu open-on-hover bottom> </v-menu>
                <v-avatar color="light">
                    <v-icon size="30"> mdi-account-circle </v-icon>
                </v-avatar>
            </v-col>
        </v-app-bar>

        <!-- ================== SIDE BAR ============== -->
        <v-navigation-drawer class="aside-navigation" app v-model="drawer">
            <v-toolbar-title>
                <router-link to="/">
                    <img
                        class="py-1 pl-4 d-flex justify-start align-center"
                        height="40"
                        src="assets/images/zenetys-fg-black-bg-full-transparent_LD.png"
                        alt="" />
                </router-link>
            </v-toolbar-title>
            <v-list class="pt-0 mt-0">
                <div v-for="(sectionLink, linkIndex) in menuSide" :key="linkIndex">
                    <v-list-item
                        v-if="!sectionLink.subMenus"
                        :to="getNavLinkFullRoute(sectionLink.route)"
                        active-class="deep-cyan--text text--accent-4"
                        class="v-list-item"
                        dense
                        :style="sectionLink.route ? '' : 'opacity:0.5'">
                        <v-list-item-action class="mr-4">
                            <v-icon size="20">{{ sectionLink.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-title v-text="sectionLink.name" />
                    </v-list-item>
                </div>
            </v-list>
            <v-spacer></v-spacer>
            <v-list dense class="mt-5 mb-2">
                <p class="ml-5 mb-1 font-weight-light">Recent queries</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="recentQueries.length > 0">
                    <v-list-item
                        v-for="(query, queryIndex) in recentQueries"
                        :key="queryIndex"
                        active-class="black"
                        class="list-item">
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-history</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title
                                @click="loadRecentQuery(query)"
                                class="font-weight-regular"
                                :title="getHistoryQueryText(query)"
                                v-text="getHistoryQueryText(query)"></v-list-item-title>
                        </v-list-item-content>
                        <v-icon
                            @click="removeSavedQuery('recent-queries', query)"
                            size="14"
                            class="list-item-remove-icon algin-end justify-end"
                            >mdi-close</v-icon
                        >
                    </v-list-item>
                </v-list>
                <span v-else class="ml-5 caption"> Empty list </span>
            </v-list>

            <v-list dense>
                <p class="ml-5 mb-1 font-weight-light">Bookmarks</p>
                <v-divider></v-divider>
                <v-list color="" class="mt-0" v-if="bookMarks.length > 0">
                    <v-list-item v-for="(bookmark, bookmarkIndex) in bookMarks" :key="bookmarkIndex" class="list-item">
                        <v-list-item-icon class="mr-0 align-start item-icon">
                            <v-icon size="14">mdi-bookmark-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content @click="loadRecentQuery(bookmark)">
                            <v-list-item-title
                                class="font-weight-regular"
                                :title="getBookmarksQueryText(bookmark)"
                                v-text="getBookmarksQueryText(bookmark)"></v-list-item-title>
                        </v-list-item-content>
                        <v-icon
                            @click="removeSavedQuery('bookmarks', bookmark)"
                            size="14"
                            class="list-item-remove-icon algin-end justify-end"
                            >mdi-close</v-icon
                        >
                    </v-list-item>
                </v-list>
                <span v-else class="ml-5 caption"> Empty list </span>
            </v-list>
        </v-navigation-drawer>

        <!-- ================== MAIN CONTENT =========== -->
        <v-row>
            <v-col cols="12">
                <router-view class="mx-4 mt-4"></router-view>
                <Message />
            </v-col>
        </v-row>

        <v-bottom-navigation id="bottombar" fixed hide-on-scroll grow height="" :style="this.bottomBarStyle">
            <v-col cols="12">
                <v-card>
                    <TimeLine @error="onError" class="bottom-timeline" />
                </v-card>
            </v-col>
        </v-bottom-navigation>
    </div>
</template>

<!-- FIXME: check/remove, add scoped -->
<style lang="scss" scoped>
.v-navigation-drawer__border {
    display: none;
}

::v-deep {
    .v-navigation-drawer__content {
        margin-top: 47px;
        position: relative;
        border-top: solid 1px rgba(0, 0, 0, 0.12);
    }

    .v-navigation-drawer__border {
        top: 47px;
    }

    .v-toolbar__title {
        margin-top: -44px;
        position: fixed;
    }
}

.list-item {
    height: 20px;
    min-height: 20px !important;
    cursor: pointer;

    .list-item-remove-icon {
        visibility: hidden;
    }

    &:hover {
        background-color: #f7f7f7;
        .list-item-remove-icon {
            visibility: visible;
        }
    }
}

.select-entity-menu {
    z-index: 10;
}

header {
    border-bottom: solid 1px rgba(0, 0, 0, 0.12) !important;
}

.select-inventory-mode {
    display: flex;
    background-color: #e8e8e8d6;
    height: 38px;
}

.bottom-timeline {
    height: 80px;
}

.aside-navigation {
    z-index: 10;

    .item-icon {
        margin-top: 2px !important;
    }
}

a {
    text-decoration: none;
}
</style>

<script>
import { mapActions } from 'vuex';
import TimeLine from '@/components/TimeLine.vue';
import Message from '@/components/Message.vue';

export default {
    name: 'Home',
    components: {
        TimeLine,
        Message,
    },
    data() {
        return {
            inventoryModes: ['devices', 'fdb'],
            defaultInventoryMode: 'devices',
            drawer: true,
            searchUpdateTimeOut: 500,
            searchTimeOutId: null,
            keepSearch: true,
            menuSide: [
                {
                    name: 'Inventory',
                    icon: 'mdi-grid',
                    route: { name: 'ViewInventory' },
                },
                {
                    name: 'VLAN matrix',
                    icon: 'mdi-table',
                    route: { name: 'ViewVlanMatrix' },
                },
                {
                    name: 'L2 schema',
                    icon: 'mdi-graph',
                },
                {
                    name: 'OUI lookup',
                    icon: 'mdi-help-network-outline',
                    route: { name: 'ViewOui' },
                },
            ],
            recentQueries: [],
            bookMarks: [],
            entityDatabases: [],
            selectedEntity: null,
            search: '',
        };
    },
    computed: {
        storeEntities() {
            return this.$store.state.storeEntities;
        },
        routeEntity() {
            return this.$route.query.entity;
        },
        routeDatabase() {
            return this.$route.query.db;
        },
        routeSearch() {
            return this.$route.query.search;
        },
        routeName() {
            return this.$route.name;
        },
        storeInventoryMode: {
            get() {
                return this.$store.getters.storeInventoryMode;
            },
            set(newInventoryMode) {
                this.$store.commit('EDIT_STORE_INVENTORY_MODE', newInventoryMode);
            },
        },
        storeEntityDatabases: {
            get() {
                return this.$store.state.storeEntityDatabases;
            },
            set(newEntityDatabases) {
                this.$store.commit('EDIT_STORE_ENTITY_DATABASES', newEntityDatabases);
            },
        },
        /**
         * Dynamic bottom bar style depending on the current breakpoint
         */
        bottomBarStyle() {
            return this.$vuetify.breakpoint.mdAndDown
                ? 'padding-left:5px;padding-right:5px;'
                : 'padding-left:261px;padding-right:5px;';
        },
    },
    methods: {
        ...mapActions(['updateStoreInfoMessage']),
        /**
         * Run a new search query on a middlemouse click (paste) in the search input
         */
        onClickMouseMiddle() {
            clearTimeout(this.searchTimeOutId);
            setTimeout(() => this.redirectToUpdateSearch(), 100);
        },
        /**
         * Set the drawer value depending on the current breakpoint
         */
        drawerValueByBreakpoint() {
            this.drawer = !this.$vuetify.breakpoint.mdAndDown;
        },
        /**
         * Handle API errors
         * @param {*} payload - error payload
         */
        onError(payload) {
            this.$store.commit('EDIT_STORE_INFO_MESSAGE', payload);
            console.log(this.$store.state.storeInfoMessage);
        },
        /**
         * Toggle the persistence of the search query upon navigation
         */
        toggleKeepSearch() {
            this.keepSearch = !this.keepSearch;
        },
        /**
         * Empties the search query
         */
        clearSearch() {
            this.search = '';
        },
        /**
         * Generate a label for a recent search query
         * @param {object} query - The query object
         * @return {string} The generated recent query label
         */
        getHistoryQueryText(query) {
            return query.query.inventoryMode + ' / ' + query.query.search;
        },
        /**
         * Generate a label for a bookmark
         * @param {object} bookmark - The bookmark object
         * @return {string} The generated bookmarked label
         */
        getBookmarksQueryText(bookmark) {
            return (
                bookmark.query.inventoryMode +
                (bookmark.query.search ? ' / ' + bookmark.query.search : '') +
                (bookmark.label ? ' / ' + bookmark.label : '')
            );
        },
        /**
         * Navigate to a recent search query or bookmark.
         * @param {object} query - The query object
         */
        loadRecentQuery(query) {
            if (query.url === '/main/inventory' && query.query.inventoryMode) {
                this.storeInventoryMode = query.query.inventoryMode;
            }

            const resolvedQueryRoute = this.$router.resolve(query.url).route;

            let newRoute = {};
            newRoute.query = {
                db: resolvedQueryRoute.query.db || query.query.db || this.routeDatabase,
                search: resolvedQueryRoute.query.search || query.query.search,
                entity: query.query.entity || this.routeEntity,
            };

            const mode = query.query.inventoryMode;
            switch (mode) {
                case 'devices':
                case 'fdb':
                    newRoute.name = 'ViewInventory';
                    break;
                case 'host':
                case 'switch':
                    newRoute.path = query.url;
                    break;
            }
            this.$router.push(newRoute).catch(() => {});
        },
        /**
         * Fetch recent queries & bookmarks from local storage and filter them
         * If none are found, an empty array is save in storage
         */
        getRecentQueriesAndBookmarks() {
            const rQueries = JSON.parse(localStorage.getItem('recent-queries'));
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks'));

            rQueries
                ? (this.recentQueries = this.filterQueries(rQueries))
                : localStorage.setItem('recent-queries', JSON.stringify([]));

            bookmarks
                ? (this.bookMarks = this.filterQueries(bookmarks))
                : localStorage.setItem('bookmarks', JSON.stringify([]));
        },
        /**
         * Save a new search query or bookmark in local storage and update the view's data
         * @param {string['recent-queries'|'bookmarks']} type - The type of the query to save
         */
        setSavedQueries(type) {
            const queriesFromStorage = JSON.parse(localStorage.getItem(type));

            if (type === 'bookmarks') {
                localStorage.setItem(type, JSON.stringify(this.newBookmark(queriesFromStorage)));
            } else if (type === 'recent-queries') {
                localStorage.setItem(type, JSON.stringify(this.newRecentQuery(queriesFromStorage)));
            }

            this.getRecentQueriesAndBookmarks();
        },
        /**
         * Generate a new recent search query object and add it to the list of entity queries
         * @param {array} recentQueries - The array of current recent queries
         * @return {array} The updated recent queries array
         */
        newRecentQuery(recentQueries) {
            const allQueries = recentQueries;
            const currentEntityQueries = this.filterQueries(recentQueries);
            const newSearchQuery = { ...this.$route.query };
            newSearchQuery.search = this.search;
            newSearchQuery.inventoryMode = this.storeInventoryMode;

            const newSearch = {
                entity: this.routeEntity,
                query: newSearchQuery,
                url: '/main/inventory',
                label: document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
                index: new Date().getTime(),
            };

            /* Only save the new query if it doesn't already exist */
            if (
                this.search &&
                !currentEntityQueries.find((query) => {
                    return query.query.search === this.search && query.query.inventoryMode === this.storeInventoryMode;
                })
            ) {
                /* 5 queries maximum in storage */
                if (currentEntityQueries.length >= 5) {
                    currentEntityQueries.pop();
                }
                currentEntityQueries.push(newSearch);
            }

            return allQueries.filter((query) => query.entity !== this.routeEntity).concat(currentEntityQueries);
        },
        /**
         * Generate a new bookmark object and add it to the list of entity queries
         * @param {array} existingBookmarks - The array of current bookmarks
         * @return {array} The updated bookmarks array
         */
        newBookmark(existingBookmarks) {
            const allQueries = existingBookmarks;
            const currentEntityQueries = this.filterQueries(existingBookmarks);
            const newQuery = {
                entity: this.routeEntity,
                query: {
                    inventoryMode:
                        this.$route.path === '/main/inventory'
                            ? this.storeInventoryMode
                            : this.$route.path.includes('switch')
                            ? 'switch'
                            : 'host',
                    search: this.$route.path === 'inventory' ? this.search : '',
                },
                url: this.$route.fullPath,
                id: this.$route.params.id,
                label: document.querySelector('#device-name') ? document.querySelector('#device-name').textContent : '',
                index: new Date().getTime(),
            };

            if (
                !currentEntityQueries.find(
                    (q) =>
                        q.url === this.$route.fullPath &&
                        q.id === this.$route.params.id &&
                        q.query.inventoryMode === newQuery.query.inventoryMode
                )
            ) {
                if (currentEntityQueries.length >= 10) {
                    currentEntityQueries.pop();
                }
                currentEntityQueries.push(newQuery);
            }

            return allQueries.filter((el) => el.entity !== this.routeEntity).concat(currentEntityQueries);
        },
        /**
         * Delete a recent query from history
         * @param {string} type - The type of the query to delete
         * @param {object} query - The query object to delete
         */
        removeSavedQuery(type, query) {
            const savedQueries = JSON.parse(localStorage.getItem(type));

            savedQueries.splice(
                savedQueries.findIndex((el) => el.index === query.index),
                1
            );

            localStorage.setItem(type, JSON.stringify(savedQueries));
            this.getRecentQueriesAndBookmarks();
        },
        /**
         * Filter the queries array to only keep the ones for the current entity
         * @param {object[]} queries - The array of queries to filter
         * @return {object[]} The filtered queries array
         */
        filterQueries(queries) {
            return queries.filter((query) => query.entity === this.routeEntity).sort((a, b) => b.index - a.index);
        },
        /**
         * Fetch all DBs for the selected entity from the API
         * @return {array|null} The array of DBs for the current entity
         */
        fetchDatabasesFromEntity() {
            return this.$api
                .get(`/entity/${this.routeEntity}/databases`)
                .then((response) => response.data)
                .catch((err) => {
                    this.updateStoreInfoMessage({
                        type: 'error',
                        content: 'Cannot load databases, problem with the query.',
                        error: err,
                    });
                    return null;
                });
        },
        /**
         * @async
         * Handle the selected entity from the current route
         * > Fetch DBs from the entity
         * > Select the latest DB if none is set in the route
         * > Set queries history & bookmarks for this entity
         */
        async handleRouteEntity() {
            /* redirect to the entity-picker if none is set */
            if (!this.routeEntity) {
                this.$router.push('/entity-picker');
            }

            /* fetch the databases for the current entity */
            this.entityDatabases = await this.fetchDatabasesFromEntity();
            this.storeEntityDatabases = this.entityDatabases;

            /* Try to match the URL's Database with the ones from this entity */
            /* If no match > select the most recent Database */
            if (
                (this.routeDatabase && !this.entityDatabases?.some((db) => db.id === this.routeDatabase)) ||
                !this.routeDatabase
            ) {
                this.selectLastAvailableDb();
            }

            this.setSavedQueries('recent-queries');

            if (!this.keepSearch) {
                this.search = '';
            }
        },
        /**
         * Update the search query param in the route, and redirect
         * @param {boolean} forceInventory - If true, always redirect to the inventory page with the new search
         */
        redirectToUpdateSearch(forceInventory = false) {
            /* Update search history */
            this.setSavedQueries('recent-queries');

            const params = this.$route.params;
            const query = { ...this.$route.query };
            query.search = this.search;

            const redirection = {
                params,
                query,
                name: forceInventory ? 'ViewInventory' : this.routeName,
            };

            if (query.search !== '' || (this.routeSearch && this.routeSearch !== '')) {
                this.$router.push(redirection).catch(() => {});
            } else {
                /* If search was simply reset, replace the current route without redirecting */
                this.$router.replace(redirection).catch(() => {});
            }
        },
        /**
         * Select the latest available DB from the current entity,
         * and replace the query param in the current route
         */
        selectLastAvailableDb() {
            let dbToSelect = '';

            if (this.entityDatabases?.length > 0) {
                dbToSelect = this.entityDatabases[this.entityDatabases.length - 1].id;
            }

            const newQuery = { ...this.$route.query };
            newQuery.db = dbToSelect;
            this.$router.replace({ query: newQuery }).catch(() => {});
        },
        /**
         * Generate a full navigation link from a partial route
         * @param {object} navRoute - The partial route to generate the link from
         */
        getNavLinkFullRoute(navRoute) {
            if (!navRoute || !navRoute.name) {
                return;
            }

            const newRoute = {
                name: navRoute.name,
                query: this.$route.query,
                params: this.$route.params,
            };
            return newRoute;
        },
    },
    watch: {
        routeEntity: {
            immediate: true,
            handler(newEntity, oldEntity) {
                /* Only handle a new entity from the route if none was set,
                or if it's a different one */
                if (!oldEntity || newEntity !== oldEntity) {
                    this.handleRouteEntity();
                }
            },
        },
        routeDatabase: {
            immediate: true,
            handler(newDatabase) {
                /* Always check if the DB from the route exists on the current entity */
                if (this.entityDatabases?.length > 0 && !this.entityDatabases?.some((db) => db.id === newDatabase)) {
                    this.selectLastAvailableDb();
                }
            },
        },
        selectedEntity: {
            immediate: true,
            handler(newEntity, oldEntity) {
                /* On entity change > Update query param and redirect */
                if (oldEntity && newEntity !== oldEntity) {
                    const redirection = { ...this.$route };
                    const newQueryParams = { ...this.$route.query };
                    newQueryParams.entity = newEntity;
                    redirection.query = newQueryParams;

                    this.$router.push(redirection).catch(() => {});
                }
            },
        },
        routeName: {
            immediate: true,
            handler(newRouteName) {
                if (newRouteName !== 'ViewInventory' && !this.keepSearch) {
                    this.search = '';
                }
            },
        },
        routeSearch: {
            immediate: true,
            handler(newSearch) {
                this.search = newSearch || '';
            },
        },
        search: {
            immediate: true,
            handler(newSearch, oldSearch) {
                clearTimeout(this.searchTimeOutId);

                this.searchTimeOutId = setTimeout(() => {
                    if (oldSearch) {
                        if (oldSearch !== newSearch && newSearch !== '') {
                            /* If search has changed, update the query param and redirect to Inventory */
                            this.redirectToUpdateSearch(true);
                        }
                    } else {
                        /* Otherwise, just update the query param */
                        this.redirectToUpdateSearch();
                    }
                }, this.searchUpdateTimeOut);
            },
        },
    },
    mounted() {
        this.$nextTick(function () {
            this.drawerValueByBreakpoint();
        });

        this.getRecentQueriesAndBookmarks();
    },
    beforeMount() {
        if (!this.inventoryModes.includes(this.storeInventoryMode)) {
            this.storeInventoryMode = this.defaultInventoryMode;
        }

        this.selectedEntity = this.routeEntity;
        clearTimeout(this.searchTimeOutId);
        this.redirectToUpdateSearch();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimeOutId);
    },
};
</script>
