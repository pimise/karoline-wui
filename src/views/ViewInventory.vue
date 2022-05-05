<template>
    <div v-if="this.$route.name !== 'ViewSwitch' && this.$route.name !== 'ViewHost'">
        <ViewInventoryDevices v-if="$mystore.getInventoryMode() === 'devices'" />
        <ViewInventoryFdb v-if="$mystore.getInventoryMode() === 'fdb'" />
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
};
</script>
