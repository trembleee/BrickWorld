export class BrickType {
    id!: string;
    faceMaterials!: string[];

    constructor(brickType: string) {
        this.id = brickType;
    }
}

import { getFaceRenderMaterial } from "../materials/MaterialMap";
import { Material } from "../materials/Material";
import { BrickMaterialData } from "./BrickMaterialData";
import { logDebug } from "@/scripts/utils/Message";

type BrickMaterialsArray = [Material, Material, Material, Material, Material, Material];
const brickTypeToMaterialsMap: { [brickType: string]: [Material, Material, Material, Material, Material, Material] } = {};

export function getBrickMaterials(brickType: string) {
    let ret = brickTypeToMaterialsMap[brickType];
    if (!ret) {
        const materials: Material[] = [];
        const brickMat = BrickMaterialData[brickType];
        if (!brickMat) {
            throw "No such brickType " + brickType;
        }
        // console.log("getBrickMaterials - brickType:", brickType);

        for (const facemat of brickMat.faces) {
            // logDebug(facemat);
            materials.push(getFaceRenderMaterial(facemat));
        }
        // assersion here, check disabled
        brickTypeToMaterialsMap[brickType] = ret = materials as BrickMaterialsArray;
    }
    return ret;
}

export function getMaterialCost(brickType: string): number {
    const brickMat = BrickMaterialData[brickType];
    if (!brickMat) {
        throw "No such brickType " + brickType;
    }
    return brickMat.cost;
    return 0;
}