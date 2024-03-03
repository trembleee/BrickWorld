// 在Vue中，使用import导入图片时，实际上导入的是图片的 URL 路径?
import beacon from '@/assets/textures/beacon.png';
export const MaterialMetaData: { [material: string]: object } = {
    'pure': {
        alphaTest: 0.1,
        transparent: false,
        metalness: 0.0,
        roughness: 0.4,
        pure: true
    },
    'beacon': {
        map: beacon
    }
};

// import {} from '@/assets/textures/beacon.png'