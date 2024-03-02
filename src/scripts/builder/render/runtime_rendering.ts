import { SerializedBrickSet } from './../brick/brickSet';
import { VoxelWorld } from "@/scripts/builder/brick/VoxelWorld"

import { THREE } from "./three";

import { BrickGrid } from "../brick/brickGrid";

import { MaterialByColor } from "./MaterialByColor";

import { type_select_set_payload, type_place_brick_payload, type_remove_brick_payload } from "./dispatchAction";

import { camera } from "../Builder";
import { logDebug } from "@/scripts/utils/Message";
import { Vector2 } from "three";
import { SerializedBrick } from '../brick/brick';
import { inputStore } from '../inputs/InputStore';
import { builderStore } from '../builderStore';

export const bounds: { min?: number[], max?: number[] } = {};

const RAYCASTING_LAYER = 2;

let currentSetId = '';
const { currentSet } = builderStore;

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

function recalculateBounds() {
    bounds.min = undefined;
    bounds.max = undefined;
    currentSet.value.forEach((_, pos) => {
        updateBounds(pos);
    });
}

export function handleActions(dispatchedActions: Array<{ action: string; payload: any }>) {
    for (const item of dispatchedActions) {
        // select_set
        if (item.action === 'select_set') {
            reset();
            // the payload is a set of bricks
            // dynamic checking is impossible, checking can only be applied where invoke dispatchAction
            // This is only for convenience in writing codes
            const payload: type_select_set_payload = item.payload;
            for (const data of payload.bricks) {
                updateBounds(data.pos);
                if (data.id) {
                    logDebug("This is preserved for NFT.")
                } else {
                    // data structure in rendering
                    // first update brickData for abstract recording
                    // second dispatch actions to alter data structure in rendering
                    // finally update the dirty cells to update the geometry
                    getVoxelWorld(data.material).setVoxel(...data.pos, data?.color ?? '');
                }
            }
            // this current set is a local variable
            currentSetId = payload.setId;
            // logDebug("Selected Dataset: " + payload.setId + " CurrentSet: " + currentSetId);
        }
        // place_brick
        else if (item.action === 'place_brick' || item.action === 'remove_brick') {
            // type assertion disable the type checking, causing 'pos and positon' like bug
            const data: type_place_brick_payload = item.payload;
            // logDebug("Dataset: " + data.setId + " CurrentSet: " + currentSetId);
            if (data.setId !== currentSetId) {
                continue;
            }
            // logDebug("Action handler - placing.")
            // if(item.action === 'remove_brick')
            // TODO:
            if (item.action === 'remove_brick') {
                recalculateBounds();
            }
            else {
                updateBounds(data.pos);
            }

            if (data.brick.id) {
                logDebug("This is preserved for NFT case.")
            }
            else {
                if (data.brick.material) {
                    getVoxelWorld(data.brick.material).setVoxel(...data.pos, data.brick?.color || '');
                    // logDebug("Action handler - New brick added.")
                }
                else {
                    for (const mat in voxels)
                        voxels[mat].setVoxel(...data.pos, '');
                }
            }

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
        if (bounds.min) {
            GroundGrid.place(Math.min(bounds.min[0] - 2, -5), 0, Math.min(bounds.min[2] - 2, -5),
                Math.max(10, bounds.max![0] - bounds.min[0] + 5), Math.max(10, bounds.max![2] - bounds.min[2] + 5));
            // logDebug("Grid resized.");
        }
        else
            GroundGrid.place(-5, 0, -5, 10, 10);

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

export function getIntersectionPos(xScreen: number, yScreen: number): undefined | { position: [number, number, number], normal: [number, number, number] } {
    const x = xScreen * 2 - 1;
    const y = yScreen * -2 + 1; // note we flip Y
    const start = new THREE.Vector3();
    const end = new THREE.Vector3();
    start.setFromMatrixPosition(camera.matrixWorld);
    end.set(x, y, 1).unproject(camera);

    const rc = new THREE.Raycaster();
    rc.layers.set(RAYCASTING_LAYER);
    rc.setFromCamera(new Vector2(x, y), camera);
    const obj = rc.intersectObject(getSetObject(), true);
    if (obj?.[0]?.object?.userData?.nft)
        return {
            position: [obj[0].point.x, obj[0].point.y, obj[0].point.z],
            normal: [obj[0].face!.normal.x, obj[0].face!.normal.y, obj[0].face!.normal.z],
        };
    let closest = undefined;
    let bestD = 0;
    for (const mat in voxels) {
        const int = voxels[mat].intersectRay(start, end);
        if (!int)
            continue;
        // TODO: improve
        const d = rc.ray.origin.distanceToSquared(new THREE.Vector3(...int.position));
        if (!closest || d <= bestD) {
            bestD = d;
            closest = int;
        }
    }
    if (closest)
        return closest;
    closest = rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), new THREE.Vector3());
    if (!closest)
        return undefined;
    return {
        position: [closest.x, closest.y, closest.z],
        normal: [0, 1, 0],
    };
}

export const GroundGrid = new BrickGrid();
