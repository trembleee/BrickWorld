<template>
    <div class="absolute w-full h-screen block p-0 m-0">
        <canvas class="w-full h-full" id="backgroundgl" ref="canvas" @pointermove="onPointerMove"
            @pointerdown="onPointerDown" @pointerup="onPointerUp" />
    </div>
</template>

<script setup lang="ts">
import { setupCanvas, render, unmount, orbitControls } from '@/scripts/builder/Builder';
import { onBeforeUnmount, onMounted, ref, } from 'vue';
import { builderInputFsm } from '@/scripts/builder/inputs/BuilderInputs';
import { inputStore } from '@/scripts/builder/inputs/InputStore';

const setup = ref(false);
const canvas = ref(null as unknown as HTMLCanvasElement);

onMounted(async () => {
    // setup Canvas
    await setupCanvas(canvas.value);
    // setup input Finite State Machine

    // input setup complete here
    builderInputFsm.initialize(
        canvas.value, orbitControls.controls, inputStore
    );
    setup.value = true;

    frame();
});

onBeforeUnmount(async () => {
    await unmount();
    setup.value = false; // set this to false to stop the animation looping!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
});

const frame = () => {
    if (!setup.value) return;
    render();
    requestAnimationFrame(frame);
};

const onPointerMove = async (event: PointerEvent) => {
    await builderInputFsm.onPointerMove(event);
};
const onPointerDown = async (event: PointerEvent) => {
    await builderInputFsm.onPointerDown(event);
    if (inputStore.grabFocus)
        canvas.value.setPointerCapture(event.pointerId)
};
const onPointerUp = async (event: PointerEvent) => {
    if (inputStore.grabFocus)
        canvas.value.releasePointerCapture(event.pointerId)
    await builderInputFsm.onPointerUp(event);
};

</script>