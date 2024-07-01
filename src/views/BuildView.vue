<template>
    <div class="about">
        <!-- <h1>拼接页面（网页全屏）</h1> -->
        <div class="overlay">
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('inspect')">Inspect</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('place')">Place</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('erase')">Erase</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="Undo">Undo</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="Redo">Redo</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="Debug">Debug</v-btn>
            <PlacePanal v-if="placePaneVisible" class="color-picker"></PlacePanal>
        </div>
        <WebGLCanvas class="canvas" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { builderStore } from '@/scripts/builder/BuilderStore';
import { inputStore } from '@/scripts/builder/inputs/InputStore'
import { generateDefaultSet, deserializeSet } from "@/scripts/builder/brick/brickSetManager"
import { logDebug } from "@/scripts/utils/Message"
import { dispatchBuilderAction } from '@/scripts/builder/render/dispatchAction';
import { setupInputMap } from '@/scripts/builder/inputs/inputStates/SetupInputMap';
import { inputInitComplete } from '@/scripts/builder/inputs/InputLoading';
import PlacePanal from "@/components/builder/PlacePanal.vue"
import WebGLCanvas from '@/components/builder/WebGLCanvas.vue';
// import { getSetObject } from '@/scripts/builder/render/runtime_rendering';

const { currentSet, selectSet, resetBuilderState, undoState, redoState, debugState, saveState } = builderStore;

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

    saveState(currentSet.value.serialize());
    dispatchBuilderAction('select_set', currentSet.value); // generate the voxelWorld with its brick 
});

const Undo = async () => {
    const undoInfo = undoState();
    const newSet = deserializeSet(undoInfo);
    await selectSet(newSet);
    dispatchBuilderAction('select_set', currentSet.value);
}

const Redo = async () => {
    const redoInfo = redoState();
    const newSet = deserializeSet(redoInfo);
    await selectSet(newSet);
    dispatchBuilderAction('select_set', currentSet.value);
}

const Debug = () => {
    debugState();
}

</script>

<style>
.about {
    position: relative;
}

.overlay {
    position: relative;
    z-index: 5;
    text-align: center;

    .operators {
        margin: 15px;
    }

    .color-picker {
        position: absolute;
        top: 20px;
        left: 20px;
    }
}

.canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
}
</style>@/scripts/builder/BuilderStore