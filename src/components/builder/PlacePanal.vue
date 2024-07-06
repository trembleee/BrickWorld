<template>
    <div>
        <v-select v-model="selectedMaterial" :items="convertedData" item-value="key" item-text="name" return-object
            label="Select Material" dense>
            <template v-slot:item="{ item }">
                <v-img :src="item.icon" style="max-width: 16px; max-height: 16px; margin-right: 8px;"></v-img>
                <span>{{ item.name + " | Cost: " + item.cost }}</span>
            </template>
        </v-select>
        <ChromePicker v-if="colorPickerVisible" :value="selectedColor" @input="updateColor" />
    </div>
</template>
  
<script setup lang="ts">
import { Chrome as ChromePicker } from "vue-color";
import { ref, computed, watchEffect } from 'vue';
import { BrickMaterialData } from "@/scripts/builder/brick/BrickMaterialData"
import { inputStore } from "@/scripts/builder/inputs/InputStore";

const selectedColor = ref("#ff0000");
const selectedMaterial = ref(undefined as unknown as any);

const updateColor = (color: any) => {
    selectedColor.value = color.hex;
}

watchEffect(() => {
    inputStore.currentColor = selectedColor.value;
    console.log("InputStore - Color changed to:", inputStore.currentColor);
})

watchEffect(() => {
    inputStore.currentMaterial = selectedMaterial.value?.key;
    console.log("InputStore - Material changed to:", inputStore.currentMaterial);
})

const colorPickerVisible = computed(() => {
    return selectedMaterial.value === "pure" ? true : false;
})

const convertedData = computed(() => {
    return Object.entries(BrickMaterialData).map(([key, value]) => ({
        key,
        ...value,
    }));
});

</script>
  
<style scoped>
.color-display {
    width: 100px;
    height: 100px;
    border: 1px solid #ccc;
}

.items {
    text-align: center;
}
</style>