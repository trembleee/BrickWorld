import { THREE } from "@/scripts/builder/render/three"
import { threeSetupComplete } from "@/scripts/builder/render/three";
import { printStackTrace } from '@/scripts/utils/Message';

export type MaterialInitStruct = {
    [_: string]: any,
    alphaTest?: number,
    transparent?: boolean,
    metalness?: number,
    roughness?: number,
    color?: number, // hex
    side?: number

    // other params that don't used in THREE.Material constructor
    map?: string,
    pure?: boolean
}

await threeSetupComplete;
const textureLoader = new THREE.TextureLoader();

export class Material {
    material: THREE.MeshStandardMaterial;

    constructor(payload: MaterialInitStruct) {
        if (!payload) {
            printStackTrace();
            throw "Metarial - payload is undefined!";
        }

        const threeMeshConstructInfo: { [_: string]: any } = {};
        for (const item in payload) {
            if (item === 'pure' || item === 'map') continue;
            threeMeshConstructInfo[item] = payload[item];
        }

        let texture: THREE.Texture = undefined as unknown as THREE.Texture;
        if (payload?.map) {
            // texture loading
            texture = textureLoader.load(payload.map);
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.NearestFilter;
            threeMeshConstructInfo.map = texture;
        }

        // const { alphaTest, transparent, metalness, roughness, color } = payload;
        this.material = new THREE.MeshStandardMaterial(threeMeshConstructInfo);
    }
}