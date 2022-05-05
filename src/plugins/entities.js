import Api from '@/plugins/api';
import MyStore from '@/plugins/myStore';

export default {
    /**
     * Fetch entities from the API and store them.
     * @async
     */
    async fetchStoreEntities() {
        await Api.get('/entities')
            .then((response) => {
                MyStore.setEntities(response.data);
            })
            .catch((error) => {
                console.log('Error fetching entities :', error);
                const message = {
                    type: 'error',
                    content: 'Can not retrieve entities. Problem with query.',
                    error: error,
                };
                MyStore.setInfoMessage(message);
            });
    },
};
