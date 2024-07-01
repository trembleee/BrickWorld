// 在Vue中，使用import导入图片时，实际上导入的是图片的 URL 路径?
import {
    THREE,
    threeSetupComplete
} from '@/scripts/builder/render/three';

import beacon from '@/assets/textures/beacon.png';
import glass from '@/assets/textures/glass.png';
import red_brick from '@/assets/textures/brick.png'
import cactus_bottom from '@/assets/textures/cactus_bottom.png'
import cactus_side from '@/assets/textures/cactus_side.png'
import cactus_top from '@/assets/textures/cactus_top.png'
import cobblestone_mossy from '@/assets/textures/cobblestone_mossy.png'
import cobblestone from '@/assets/textures/cobblestone.png'
import dirt from '@/assets/textures/dirt.png'
import furnace_front_on from '@/assets/textures/furnace_front_on.png'
import furnace_side from '@/assets/textures/furnace_side.png'
import furnace_top from '@/assets/textures/furnace_top.png'
import glowstone from '@/assets/textures/glowstone.png'
import grass_side from '@/assets/textures/grass_side.png'
import grass_top from '@/assets/textures/grass_top.png'
import hardened_clay from '@/assets/textures/hardened_clay.png'
import ice from '@/assets/textures/ice.png'
import leaves_big_oak from '@/assets/textures/leaves_big_oak.png'
import log_big_oak_top from '@/assets/textures/log_big_oak_top.png'
import log_big_oak_side from '@/assets/textures/log_big_oak.png'
import pumpkin_face_on from '@/assets/textures/pumpkin_face_on.png'
import pumpkin_side from '@/assets/textures/pumpkin_side.png'
import pumpkin_top from '@/assets/textures/pumpkin_top.png'
import redstone_block from '@/assets/textures/redstone_block.png'
import tnt_bottom from '@/assets/textures/tnt_bottom.png'
import tnt_side from '@/assets/textures/tnt_side.png'
import tnt_top from '@/assets/textures/tnt_top.png'
import under_water from '@/assets/textures/underwater.png'


await threeSetupComplete;

export const MaterialMetaData: { [material: string]: object } = {
    'pure': {
        alphaTest: 0.1,
        transparent: false,
        metalness: 0.0,
        roughness: 0.4,
        pure: true
    },
    'beacon': { map: beacon },
    'glass': {
        map: glass,
        transparent: true,
        side: THREE.DoubleSide,
        alphaTest: 0.5
    },
    'red_brick': { map: red_brick },
    'cactus_bottom': { map: cactus_bottom },
    'cactus_side': { map: cactus_side },
    'cactus_top': { map: cactus_top },
    'cobblestone_mossy': { map: cobblestone_mossy },
    'cobblestone': { map: cobblestone },
    'dirt': { map: dirt },
    'furnace_front_on': { map: furnace_front_on },
    'furnace_side': { map: furnace_side },
    'furnace_top': { map: furnace_top },
    'glowstone': { map: glowstone },
    'grass_side': { map: grass_side, color: 0xa5a5a5 },
    'grass_top': { map: grass_top, color: 0x77b849 },
    'hardened_clay': { map: hardened_clay },  // 修正了拼写错误
    'ice': { map: ice },
    'leaves_big_oak': {
        map: leaves_big_oak, transparent: true,
        side: THREE.DoubleSide,
        color: 0x77b849,
    },
    'log_big_oak_top': { map: log_big_oak_top },
    'log_big_oak_side': { map: log_big_oak_side },
    'pumpkin_face_on': { map: pumpkin_face_on },
    'pumpkin_side': { map: pumpkin_side },
    'pumpkin_top': { map: pumpkin_top },
    'redstone_block': { map: redstone_block },
    'tnt_bottom': { map: tnt_bottom },
    'tnt_side': { map: tnt_side },
    'tnt_top': { map: tnt_top },
    'under_water': {
        map: under_water,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: false
    },
};

// import {} from '@/assets/textures/beacon.png'