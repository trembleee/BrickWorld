<template>
    <div class="absolute w-full h-screen block p-0 m-0">
        <canvas class="w-full h-full" id="backgroundgl" ref="canvas" />
        <!-- @pointermove="onPointerMove"
            @pointerdown="onPointerDown"
            @pointerup="onPointerUp"/> -->
    </div>
</template>

<script setup lang="ts">
import { setupCanvas, render, unmount } from '@/scripts/builder/Builder';
import { onBeforeUnmount, onMounted, ref, } from 'vue';

const setup = ref(false);
const canvas = ref(null as unknown as HTMLCanvasElement);

onMounted(async () => {
    await setupCanvas(canvas.value);
    setup.value = true;
    // watchEffect(() => {
    //     console.log("Client Width: " + canvas.value.clientWidth);
    //     console.log("Client Height: " + canvas.value.clientHeight);
    //     console.log("Window innerWidth: " + window.innerWidth);
    //     console.log("Window innerHeight: " + window.innerHeight);
    // })
    frame();
});

onBeforeUnmount(async () => {
    await unmount();
});

const frame = () => {
    if (!setup.value) return;
    render();
    requestAnimationFrame(frame);
};

</script>