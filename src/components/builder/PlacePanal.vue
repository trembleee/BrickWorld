<template>
    <div>
        <!-- <div class="color-display" :style="{ backgroundColor: selectedColor }"></div> -->
        <select v-model="selectedMaterial">
            <option v-for="(value, key, index) in BrickMaterialData" :value="key" :key="index">{{ value.name }}</option>
        </select>
        <ChromePicker v-if="colorPickerVisible" :value="selectedColor" @input="updateColor" />
    </div>
</template>
  
<script setup lang="ts">
import { Chrome as ChromePicker } from "vue-color";
import { ref, computed, watchEffect } from 'vue';
import { BrickMaterialData } from "@/scripts/builder/brick/BrickMaterialData"
import { inputStore } from "@/scripts/builder/inputs/InputStore";
import { logDebug } from "@/scripts/utils/Message";

const selectedColor = ref("#ff0000");
const selectedMaterial = ref("pure");

const updateColor = (color: any) => {
    selectedColor.value = color.hex;
}

watchEffect(() => {
    inputStore.currentColor = selectedColor.value;
    logDebug("InputStore - Color changed to:", inputStore.currentColor);
})

watchEffect(() => {
    inputStore.currentMaterial = selectedMaterial.value;
    logDebug("InputStore - Material changed to:", inputStore.currentMaterial);
})

const colorPickerVisible = computed(() => {
    return selectedMaterial.value === "pure" ? true : false;
})

</script>
  
<style scoped>
.color-display {
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;
}
</style>