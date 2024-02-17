import { VoxelWorld } from "@/scripts/builder/brick/VoxelWorld"

import { THREE } from "./three";

import { MaterialByColor } from "./MaterialByColor";

import { type_select_set_payload } from "./dispatchAction";

import { camera } from "../Builder";
import { logDebug } from "@/scripts/utils/Message";

export const bounds: { min?: number[], max?: number[] } = {};

const RAYCASTING_LAYER = 2;

let currentSet = '';

let setObject: THREE.Object3D;

let voxels: { [material: string]: VoxelWorld } = {};
// const nfts: { [key: string]: briqNFT } = {};

function reset() {
    for (const mat in voxels)
        voxels[mat].reset();
    voxels = {};
    // for (const id in nfts)
    //     nfts[id].setPos();
    setObject.clear();
    bounds.min = undefined; //new THREE.Vector3(0, 0, 0);
    bounds.max = undefined; //new THREE.Vector3(0, 0, 0);
}

function getVoxelWorld(material: string) {
    if (!voxels[material]) {
        // voxels[material] = new VoxelWorld({ cellSize: 10, material: getRenderMaterial(material) });
        voxels[material] = new VoxelWorld({ cellSize: 10, material: new MaterialByColor() });
        voxels[material].object.layers.set(RAYCASTING_LAYER);
        setObject.add(voxels[material].object);
    }
    return voxels[material];
}

export function getSetObject() {
    if (setObject)
        return setObject;
    setObject = new THREE.Object3D();
    for (const material in voxels)
        setObject.add(voxels[material].object);
    return setObject;
}

function updateBounds(pos: [number, number, number]) {
    if (!bounds.min) {
        bounds.min = pos;
        bounds.max = pos;
        return;
    }
    bounds.min = [0, 1, 2].map(i => Math.min(pos[i], bounds.min![i]));
    bounds.max = [0, 1, 2].map(i => Math.max(pos[i], bounds.max![i]));
}

export function handleActions(dispatchedActions: Array<{ action: string; payload: any }>) {
    for (const item of dispatchedActions) {
        if (item.action === 'select_set') {
            reset();
            // the payload is a set of bricks
            const payload = item.payload as type_select_set_payload;
            for (const data of payload.bricks) {
                updateBounds(data.pos);
                if (data.id) {
                    logDebug("This is preserved for NFT.")
                } else {
                    getVoxelWorld(data.material).setVoxel(...data.pos, data?.color ?? '');
                }
            }
            // this current set is a local variable
            currentSet = payload.setId;
        }
    }

    // post process per frame
    if (dispatchedActions.length) {
        // clear the action array
        dispatchedActions.length = 0;
        // update altered voxelworld
        for (const mat in voxels) {
            voxels[mat].updateDirty();
        }

        // update grid
        // TODO

        const getCanvasSize = () => {
            if (!bounds.min)
                return 5;
            return Math.max(5, ...[0, 1, 2].map(i => bounds.max![i] - bounds.min![i]));
        }

        if (camera instanceof THREE.PerspectiveCamera) {
            // attributes of perspective camera
            camera.near = 0.5;
            camera.far = Math.max(4000, getCanvasSize() * 100);
            camera.updateProjectionMatrix();
        }
    }
}