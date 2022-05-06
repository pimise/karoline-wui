<template>
    <div v-if="this.$route.name !== 'ViewSwitch' && this.$route.name !== 'ViewHost'">
        <ViewInventoryDevices v-if="inventoryMode === 'devices'" />
        <ViewInventoryFdb v-if="inventoryMode === 'fdb'" />
    </div>
    <div v-else>
        <router-view></router-view>
    </div>
</template>

<script>
import ViewInventoryDevices from '@/views/ViewInventoryDevices.vue';
import ViewInventoryFdb from '@/views/ViewInventoryFdb.vue';

export default {
    name: 'ViewInventory',
    components: {
        ViewInventoryDevices,
        ViewInventoryFdb,
    },
    computed: {
        inventoryMode() {
            return this.$route.query?.inventoryMode;
        },
    },
};
</script>
