<template>
    <div class="about">
        <!-- <h1>拼接页面（网页全屏）</h1> -->
        <div class="overlay">
            <button @click="switchToState('inspect')">Inspect</button>
            <button @click="switchToState('place')">Place</button>
            <button @click="switchToState('erase')">Erase</button>
            <PlacePane v-if="placePaneVisible" class="color-picker"></PlacePane>
        </div>
        <WebGLCanvas class="canvas" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { builderStore } from '@/scripts/builder/builderStore';
import { inputStore } from '@/scripts/builder/inputs/InputStore'
import { generateDefaultSet } from "@/scripts/builder/brick/brickSetManager"
import { logDebug } from "@/scripts/utils/Message"
import { dispatchBuilderAction } from '@/scripts/builder/render/dispatchAction';
import { setupInputMap } from '@/scripts/builder/inputs/inputStates/SetupInputMap';
import { inputInitComplete } from '@/scripts/builder/inputs/InputLoading';
import PlacePane from "@/components/builder/PlacePane.vue"
import WebGLCanvas from '@/components/builder/WebGLCanvas.vue';
// import { getSetObject } from '@/scripts/builder/render/runtime_rendering';

const { currentSet, selectSet, resetBuilderState } = builderStore;

// here currentInput is just a normal const viarable, not a reactive, since it is a copy of the inputStore.currenInput
// const { switchToState, currentInput } = inputStore;
const { switchToState } = inputStore;


const placePaneVisible = computed(() => {
    return inputStore.currentInput === "place" ? true : false;
});

async function initializeStartSet() {
    let set = undefined;
    if (!currentSet.value) {
        set = generateDefaultSet();
        if (set) // set current set 
            await selectSet(set);
    }
    if (!set) {
        logDebug("INITIALIZE START SET FAILED.");
        return;
    }
    logDebug('BUILDER - START SET INITIALIZED');
}

onBeforeMount(async () => {
    setupInputMap();
    resetBuilderState();
    await inputInitComplete;
    await initializeStartSet(); // currentSet is setup
    // It is then when currentSet local viarable in file runtime_rendering have a chance to be accessed
    // So maybe the currentSet local viarable can be replaced by currentSet setData?

    dispatchBuilderAction('select_set', currentSet.value); // generate the voxelWorld with its brick 
});
</script>

<style>
.overlay {
    z-index: 5;

    .color-picker {
        position: absolute;
        top: 20px;
        left: 20px;
    }
}

.canvas {
    position:absolute;
    top: 0;
    left: 0;
    z-index: 4;
}
</style>