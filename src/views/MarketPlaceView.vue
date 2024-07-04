<template>
  <v-app>
    <v-container fluid>
      <v-tabs v-model="tab">
        <v-tab>方块</v-tab>
        <v-tab>模型</v-tab>
        
        <v-tab-item>
          <BrickMarket />
        </v-tab-item>
        <v-tab-item>
          <ModelMarket />
        </v-tab-item>
      </v-tabs>
    </v-container>
  </v-app>
</template>

<script>
import BrickMarket from '@/components/BrickMarket.vue';
import ModelMarket from '@/components/ModelMarket.vue';

export default {
  data() {
    return {
      tab: 0, // 默认选中的选项卡索引
    };
  },
  components: {
    BrickMarket,
    ModelMarket
  }
};
</script>

<style>
/* 添加样式（如果需要） */
</style>
