<template>
    <div class="absolute w-full h-screen block p-0 m-0">
        <canvas
            class="w-full h-full"
            id="backgroundgl"
            ref="canvas"
        />
            <!-- @pointermove="onPointerMove"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"/> -->
    </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';

const setup = ref(false);
const canvas = ref(null as unknown as HTMLCanvasElement);

onMounted(async () => {

});

onBeforeUnmount(async() => {

});

const frame = () => {
    if(!setup.value) return;
    
}

</script>