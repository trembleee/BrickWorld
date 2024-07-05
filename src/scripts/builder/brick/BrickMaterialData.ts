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
import pure_icon from '@/assets/lightmap.png'

type BrickMaterialsArray = [string, string, string, string, string, string];
type BrickMaterialDataType = {
    [brick: string]: {
        faces: BrickMaterialsArray,
        name: string,
        cost: number,
        icon: string
    }
};
export const BrickMaterialData: BrickMaterialDataType = {
    'pure': {
        // front back top bottom left right
        faces: ['pure', 'pure', 'pure', 'pure', 'pure', 'pure'],
        name: "CSSColorMaterial",
        cost: 1,
        icon: pure_icon
    },
    'beacon': {
        faces: ['beacon', 'beacon', 'beacon', 'beacon', 'beacon', 'beacon'],
        name: "Beacon",
        cost: 3,
        icon: beacon
    },
    'glass': {
        faces: ['glass', 'glass', 'glass', 'glass', 'glass', 'glass'],
        name: "Glass",
        cost: 2,
        icon: glass
    },
    'red_brick': {
        faces: ['red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick'],
        name: "Red Brick",
        cost: 3,
        icon: red_brick
    },
    'cactus': {
        faces: ['cactus_side', 'cactus_side', 'cactus_top', 'cactus_bottom', 'cactus_side', 'cactus_side'],
        name: "Cactus",
        cost: 5,
        icon: cactus_side
    },
    'cobblestone': {
        faces: ['cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone'],
        name: "Cobblestone",
        cost: 2,
        icon: cobblestone
    },
    'cobblestone_mossy': {
        faces: ['cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy'],
        name: "Cobblestone Mossy",
        cost: 3,
        icon: cobblestone_mossy
    },
    'clay_with_grass': {
        faces: ['grass_side', 'grass_side', 'grass_top', 'dirt', 'grass_side', 'grass_side'],
        name: "Grass Clay",
        cost: 1,
        icon: grass_side
    },
    'dirt': {
        faces: ['dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt'],
        name: "Dirt",
        cost: 1,
        icon: dirt
    },
    'furnace': {
        faces: ['furnace_front_on', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side'],
        name: "Furnace",
        cost: 2,
        icon: furnace_front_on
    },
    'glowstone': {
        faces: ['glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone'],
        name: "Glowstone",
        cost: 4,
        icon: glowstone
    },
    'ice': {
        faces: ['ice', 'ice', 'ice', 'ice', 'ice', 'ice'],
        name: "Ice",
        cost: 4,
        icon: ice
    },
    'leaves_big_oak': {
        faces: ['leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak'],
        name: "Leaves Big Oak",
        cost: 1,
        icon: leaves_big_oak
    },
    'log_big_oak': {
        faces: ['log_big_oak_side', 'log_big_oak_side', 'log_big_oak_top', 'log_big_oak_top', 'log_big_oak_side', 'log_big_oak_side'],
        name: "Log Big Oak",
        cost: 1,
        icon: log_big_oak_top
    },
    'pumpkin': {
        faces: ['pumpkin_face_on', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
        name: "Pumpkin",
        cost: 5,
        icon: pumpkin_face_on
    },
    'redstone_block': {
        faces: ['redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block'],
        name: "Redstone Block",
        cost: 4,
        icon: redstone_block
    },
    'tnt': {
        faces: ['tnt_side', 'tnt_side', 'tnt_top', 'tnt_bottom', 'tnt_side', 'tnt_side'],
        name: "TNT",
        cost: 5,
        icon: tnt_side
    },
    'under_water': {
        faces: ['under_water', 'under_water', 'under_water', 'under_water', 'under_water', 'under_water'],
        name: "Under Water",
        cost: 1,
        icon: under_water
    }
}