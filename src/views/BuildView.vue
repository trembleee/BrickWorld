<template>
    <div class="about">
        <!-- <h1>拼接页面（网页全屏）</h1> -->
        <div class="overlay">
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('inspect')">Inspect</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('place')">Place</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="switchToState('erase')">Erase</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="Undo">Undo</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="Redo">Redo</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="ClearAll">ClearAll</v-btn>
            <v-btn v-if="false" outlined color="#00ccff" class="operators" @click="Debug">Debug</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="MintCurrentBrickSetToModel">Mint</v-btn>
            <!-- <v-btn outlined color="#00ccff" class="operators" @click="getScreenShot">ScreenShot</v-btn> -->
            <v-btn outlined color="#00ccff" class="operators" @click="check">Check</v-btn>
            <v-btn outlined color="#00ccff" class="operators" @click="getBricksetJson">Get JSON</v-btn>
            <!-- <img id="screen-shot" :src="screenShotURL" alt="screen shot" v-if="screenShotURL"> -->
            <v-img id="screen-shot" :src="screenShotURL" alt="screen shot" aspect-ratio="1.7"></v-img>
            <PlacePanal v-if="placePaneVisible" class="color-picker"></PlacePanal>
        </div>
        <WebGLCanvas class="canvas" />
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onBeforeUnmount, computed, ref, Ref } from 'vue';
import { builderStore } from '@/scripts/builder/BuilderStore';
import { inputStore } from '@/scripts/builder/inputs/InputStore'
import { contractStore } from '@/scripts/Contracts/ContractsStore'
import { generateDefaultSet, deserializeSet, loadOakTree, generateEmptySetById } from "@/scripts/builder/brick/brickSetManager"
import { logDebug } from "@/scripts/utils/Message"
import { dispatchBuilderAction } from '@/scripts/builder/render/dispatchAction';
import { setupInputMap } from '@/scripts/builder/inputs/inputStates/SetupInputMap';
import { inputInitComplete } from '@/scripts/builder/inputs/InputLoading';
import PlacePanal from "@/components/builder/PlacePanal.vue"
import WebGLCanvas from '@/components/builder/WebGLCanvas.vue';
import { S3 } from 'aws-sdk'
import { canvasSetupComplete, canvasInstance, render } from '@/scripts/builder/Builder'
import { getMaterialCost } from '@/scripts/builder/brick/BrickType'
import { SerializedBrickSet } from '@/scripts/builder/brick/brickSet';
// import { getSetObject } from '@/scripts/builder/render/runtime_rendering';

const { currentSet, selectSet, resetBuilderState, undoState, redoState, getCurrenState, saveState, debugState } = builderStore;

// here currentInput is just a normal const viarable, not a reactive, since it is a copy of the inputStore.currenInput
const { switchToState } = inputStore;

const { InitSolidityContracts, getOwningBricks, contractCall_Model, contractCall_Brick, getAccountAddress, modelContractAddress, isApprovedForAll } = contractStore;


const placePaneVisible = computed(() => {
    return inputStore.currentInput === "place" ? true : false;
});

// upload off-chain data
const s3 = new S3({
    endpoint: "https://endpoint.4everland.co",
    credentials: {
        accessKeyId: "9GQN8TMC41HL887LLU4F",
        secretAccessKey: "8kAjf+VheYGNubUKn1aonueE5FyPz0Agp96lBFyX"
    },
    region: "4EVERLAND",
});

// const my4EverlandAPIKey = "7842d9c80b17e8bb95a6b9d7f2b62b5c";
const my4EverlandIPFSGateway = "dcc5a59850fff729ce0d49b9f55baaf2";
const screenShotURL = ref(null as unknown as string);
const brickSetDataURI = ref(null as unknown as string);
const serializedBrickSetToUpload = ref(null as unknown as SerializedBrickSet);

console.log(s3);


async function initializeStartSet() {
    let set = undefined;
    if (!currentSet.value) {
        if (!(set = loadOakTree())) {
            set = generateDefaultSet();
        }

        // set = loadEmptySet();

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
    await InitSolidityContracts(); // wait contract init
    // It is then when currentSet local viarable in file runtime_rendering have a chance to be accessed
    // So maybe the currentSet local viarable can be replaced by currentSet setData?

    saveState(currentSet.value.serialize());
    dispatchBuilderAction('select_set', currentSet.value); // generate the voxelWorld with its brick 
});

onBeforeUnmount(async () => {
    // currentSet.value = null as unknown as BrickSet
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

const ClearAll = async () => {
    const info = getCurrenState();
    const newSet = generateEmptySetById(info.id as string);
    await selectSet(newSet);
    saveState(newSet.serialize());
    dispatchBuilderAction('select_set', currentSet.value);
}

const MintCurrentBrickSetToModel = async () => {
    // console.log(owningBricks);
    const brickToMintIds: number[] = []
    const setInfo = getCurrenState();
    const numToMint = setInfo.bricks.length;
    for (let i = 0; i < numToMint; i++) {
        if (setInfo.bricks[i].data.id) {
            brickToMintIds.push(Number(setInfo.bricks[i].data.id))
        }
    }
    await getScreenShot();
    await uploadOffChainDataOfBrickSet();

    if (brickSetDataURI.value) { // check and uploading are bith successful
        console.log(brickSetDataURI.value);


        for (const brick of serializedBrickSetToUpload.value.bricks) {
            if (brick.data.id) {
                brickToMintIds.push(Number(brick.data.id));
            }
            else {
                console.error("Trying to mint model with brick with out id!!");
            }

            // contractCall_Brick("isApprovedForAll", getAccountAddress(), modelContractAddress)
        }

        // call contracts
        if (await isApprovedForAll()) {
            await contractCall_Model("safeMint", getAccountAddress(), brickToMintIds, brickToMintIds.length, brickSetDataURI.value);
        }
        else if (await contractCall_Brick("setApprovalForAll", modelContractAddress, true)) {
            await contractCall_Model("safeMint", getAccountAddress(), brickToMintIds, brickToMintIds.length, brickSetDataURI.value);
        }
    }
    else {
        console.log("Do not have valid off-chain data url, uploading might failed.");
    }
}

const getScreenShot = async () => {
    await canvasSetupComplete;
    const canvas = canvasInstance.value;
    const ctx = canvas.getContext('webgl2');
    if (ctx) {
        console.log(ctx);
        await render();
        screenShotURL.value = canvas.toDataURL('image/jpeg', 0.1);
        console.log(screenShotURL.value);
    }
}

const checkSufficientBrick = async (SetToUpload: Ref<SerializedBrickSet>): Promise<boolean> => {
    // await refreshOwningBricks();
    const OwningBricks = await getOwningBricks();
    const owningBricksCopy: typeof OwningBricks = JSON.parse(JSON.stringify(OwningBricks));
    console.log("Owning bricks: ", owningBricksCopy);
    const currentState = getCurrenState();
    const setInfo: typeof currentState = JSON.parse(JSON.stringify(currentState));
    if (!setInfo) return false;

    for (const brick of setInfo.bricks) {
        const mat = brick.data.material;
        if (mat) {
            const cost = getMaterialCost(mat);
            let matchFound: boolean = false;
            for (let i = cost; i <= 5; i++) {
                if (owningBricksCopy[String(i)] && owningBricksCopy[String(i)].length) {
                    console.log(owningBricksCopy[String(i)]);

                    const brickToCost = owningBricksCopy[String(i)].pop();
                    brick.data.id = brickToCost?.id;
                    brick.data.rarity = Number(brickToCost?.rarity);
                    matchFound = true;
                    break;
                }
            }
            // insufficient rarity to pay the cost
            if (!matchFound) {
                return false;
            }
        }
    }
    SetToUpload.value = setInfo;
    console.log("Check Result: ", setInfo);

    return true;
}

const check = async () => {
    const checkResult = await checkSufficientBrick(serializedBrickSetToUpload);
    if (checkResult) {
        alert("Congratulations! You have enough brick to mint the model!");
    }
    else {
        alert("Sorry, You don't have enough brick to mint the model...")
    }
    console.log("Check Result: ", await checkSufficientBrick(serializedBrickSetToUpload));
}

const Debug = () => {
    debugState();
}

const getBricksetJson = () => {
    const info = JSON.parse(JSON.stringify(getCurrenState()));
    const JSONInfo = JSON.stringify(info);
    console.log(JSONInfo);
}

const uploadOffChainDataOfBrickSet = async () => {
    brickSetDataURI.value = null as unknown as string;
    if (s3 && screenShotURL.value && currentSet.value) {
        // successful check
        if (await checkSufficientBrick(serializedBrickSetToUpload)) {

            console.log("Check success! You have enough brick to mint the model.");

            // thumnail
            serializedBrickSetToUpload.value.thumbnailPicture = screenShotURL.value;
            const stringifiedInfo = JSON.stringify(serializedBrickSetToUpload.value);
            // console.log(serializedBrickSetToUpload.value);
            // console.log(stringifiedInfo);

            const params = {
                Bucket: "brick-world",
                Key: "/models/" + currentSet.value.id,
                ContentType: "application/json",
                Body: stringifiedInfo,
            }

            // uploading
            await s3.putObject(params).promise()
                .then((data) => {
                    console.log('Upload success', data)
                    brickSetDataURI.value = "https://" + my4EverlandIPFSGateway + ".ipfs.4everland.link/ipfs/" + data.ETag?.substring(1, data.ETag.length - 1);

                })
                .catch(err => {
                    console.log(err)
                });
        } // successful check
        else {
            console.log("Check failed! You don not have enough brick to mint the model.");
        }
    }
};

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
        top: 60px;
        left: 20px;
    }

    #screen-shot {
        position: absolute;
        top: 200px;
        left: 20px;
        width: 200px;
        height: 200px;
    }
}

.canvas {
    position: absolute;
    /* visibility: hidden; */
    top: 0;
    left: 0;
    z-index: 0;
}
</style>@/scripts/builder/BuilderStore