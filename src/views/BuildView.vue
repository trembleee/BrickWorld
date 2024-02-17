<template>
    <div class="about">
        <!-- <h1>拼接页面（网页全屏）</h1> -->
        <WebGLCanvas />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { builderStore } from '@/scripts/builder/builderStore';
import { generateDefaultSet } from "@/scripts/builder/brick/brickSetManager"
import { logDebug } from "@/scripts/utils/Message"
import { dispatchAction } from '@/scripts/builder/render/dispatchAction';

import WebGLCanvas from '@/components/builder/WebGLCanvas.vue';

const { currentSet, selectSet, resetBuilderState } = builderStore;

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
    resetBuilderState();
    await initializeStartSet(); // currentSet is setup
    dispatchAction('select_set', currentSet.value); // generate the voxelWorld with its brick 
});


</script>