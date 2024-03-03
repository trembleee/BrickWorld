<template>
    <div>
        <div class="color-display" :style="{ backgroundColor: selectedColor }"></div>
        <ChromePicker :value="selectedColor" @input="updateColor" />
    </div>
</template>
  
<script setup lang="ts">
import { Chrome as ChromePicker } from "vue-color";
import { ref } from 'vue';

// export default {
//     components: {
//         ChromePicker: Chrome
//     },
//     data() {
//         return {
//             selectedColor: "#ff0000", // 默认颜色
//         };
//     },
//     methods: {
//         updateColor(color) {
//             this.selectedColor = color.hex;
//         },
//     },
// };
const selectedColor = ref("#ff0000");
const updateColor = (color: any) => {
    selectedColor.value = color.hex;
}
</script>
  
<style scoped>
.color-display {
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;
}
</style>