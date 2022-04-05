import Api from '@/plugins/api';
import store from '@/store';

export default {
    /**
     * Fetch entities from the API and update the store.
     */
    async fetchStoreEntities() {
        await Api.get('/entities')
            .then((response) => {
                store.commit('EDIT_STORE_ENTITIES', response.data);
                store.commit('EDIT_STORE_INFO_MESSAGE', {});
            })
            .catch((error) => {
                console.log(error);
                store.commit('EDIT_STORE_INFO_MESSAGE', {
                    type: 'error',
                    content: 'Can not retrieve entities. Problem with query.',
                    error: error,
                });
            });
    },
    /**
     * Initialise the plugin and fetch entities if the store is empty.
     */
    async init() {
        const storeEntities = store.getters.storeEntities;

        if (storeEntities.length === 0)
            await this.fetchStoreEntities();
    }
};
