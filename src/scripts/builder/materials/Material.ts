import { THREE } from "@/scripts/builder/render/three"
import { threeSetupComplete } from "@/scripts/builder/render/three";
import { printStackTrace } from '@/scripts/utils/Message';

export type MaterialInitStruct = {
    alphaTest?: number,
    transparent?: boolean,
    metalness?: number,
    roughness?: number,
    map?: string,
    color?: number, // hex
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
        let texture: THREE.Texture = undefined as unknown as THREE.Texture;
        if (payload?.map) {
            texture = textureLoader.load(payload.map);
        }
        const { alphaTest, transparent, metalness, roughness, color } = payload;
        this.material = new THREE.MeshStandardMaterial({
            alphaTest,
            transparent,
            metalness,
            roughness,
            color,
            map: texture
        });
    }
}