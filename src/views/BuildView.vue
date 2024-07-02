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
            <v-btn outlined color="#00ccff" class="operators" @click="MintCurrentBrickSetToModel">Mint</v-btn>
            <PlacePanal v-if="placePaneVisible" class="color-picker"></PlacePanal>
        </div>
        <WebGLCanvas class="canvas" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, computed } from 'vue';
import { builderStore } from '@/scripts/builder/BuilderStore';
import { inputStore } from '@/scripts/builder/inputs/InputStore'
// import { contractStore } from '@/scripts/Contracts/ContractsStore'
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
const { switchToState } = inputStore;

// const { InitSolidityContracts, modelContract } = contractStore;


// //初始化合约调用相关
// import { Contract, ethers } from 'ethers';
// import brickABIJSON from '../ABIs/brickABI.json'
// import modelABIJSON from '../ABIs/modelABI.json'
// import marketABIJSON from '../ABIs/marketABI.json'

// const openseaAPI = "bcee010a55b74f14ac1a3bbd8b9dd118"
// const brickAddress = "0x8400431edd44ED24b1341024e1A5F7339554A13A"
// const modelAddress = "0x35b637c929c88cd77ec8c53682bcfd309b7edcb9"
// const marketAddress = "0x370297884a02dcf327020add676aec8a2f082999"
// const brickABI = brickABIJSON
// const modelABI = modelABIJSON
// const marketABI = marketABIJSON
// //获取provider,signer,可写合约contract
// let signer
// let provider
// let brickContract
// let modelContract
// let marketContract
// async function getInf() {
//   if (window.ethereum == null) {
//     console.log("MetaMask not installed; using read-only defaults")
//     provider = ethers.getDefaultProvider()
//   } else {
//     provider = new ethers.BrowserProvider(window.ethereum)
//     signer = await provider.getSigner()
//   }
//   brickContract = new Contract(brickAddress, brickABI, signer)
//   modelContract = new Contract(modelAddress, modelABI, signer)
//   marketContract = new Contract(marketAddress, marketABI, signer)
// }
// await getInf()

// let bricks = []
// let myAddress = ''

// onMounted(async ()=>{

// })

// async function refresh(){
//     bricks = []
//     await getMyAddress()//先获取我的地址赋值给myAddress，后面获取brick要用
//     await getBricks()
// }

// async function getMyAddress(){
//     // 获取用户地址
//     const accounts = await provider.listAccounts();
//     myAddress = accounts[0].address; // 第一个地址即为当前用户的地址
//     //console.log('当前用户地址:', address);
//     return myAddress
// }
// async function getBricks(){
//     const options = { method: 'GET', headers: { accept: 'application/json' } };

//     //调用opensea api获取地址拥有的所有brick nft
//     await fetch('https://testnets-api.opensea.io/api/v2/chain/sepolia/account/' + myAddress + '/nfts?collection=brick-3', options)
//     .then(response => response.json())
//     .then(async (response) => {
//         response.nfts.forEach(element => {
//             setBrick(element.identifier)//对每一个brick调用setbrick函数,获取稀有度加到数组中
//         });
//     })
//     .catch(err => console.error(err));
// }
// async function setBrick(id){
//     let rarity = await brickContract.getRarity(id)//获取稀有度
//     let brick = {
//         id: id,
//         rarity: rarity
//     }//创建brick
//     bricks.push(brick)//加入数组中
// }

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
    // await InitSolidityContracts(); // wait contract init
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

const MintCurrentBrickSetToModel = () => {

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