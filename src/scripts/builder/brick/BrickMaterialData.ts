type BrickMaterialsArray = [string, string, string, string, string, string];
type BrickMaterialDataType = {
    [brick: string]: {
        faces: BrickMaterialsArray,
        name: string,
        cost: number
    }
};
export const BrickMaterialData: BrickMaterialDataType = {
    'pure': {
        // front back top bottom left right
        faces: ['pure', 'pure', 'pure', 'pure', 'pure', 'pure'],
        name: "CSSColorMaterial",
        cost: 1
    },
    'beacon': {
        faces: ['beacon', 'beacon', 'beacon', 'beacon', 'beacon', 'beacon'],
        name: "Beacon",
        cost: 3
    },
    'glass': {
        faces: ['glass', 'glass', 'glass', 'glass', 'glass', 'glass'],
        name: "Glass",
        cost: 2
    },
    'red_brick': {
        faces: ['red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick'],
        name: "Red Brick",
        cost: 3,
    },
    'cactus': {
        faces: ['cactus_side', 'cactus_side', 'cactus_top', 'cactus_bottom', 'cactus_side', 'cactus_side'],
        name: "Cactus",
        cost: 5
    },
    'cobblestone': {
        faces: ['cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone'],
        name: "Cobblestone",
        cost: 2
    },
    'cobblestone_mossy': {
        faces: ['cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy'],
        name: "Cobblestone Mossy",
        cost: 3
    },
    'clay_with_grass': {
        faces: ['grass_side', 'grass_side', 'grass_top', 'dirt', 'grass_side', 'grass_side'],
        name: "Grass Clay",
        cost: 1
    },
    'dirt': {
        faces: ['dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt'],
        name: "Dirt",
        cost: 1
    },
    'furnace': {
        faces: ['furnace_front_on', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side'],
        name: "Furnace",
        cost: 2

    },
    'glowstone': {
        faces: ['glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone'],
        name: "Glowstone",
        cost: 4
    },
    'ice': {
        faces: ['ice', 'ice', 'ice', 'ice', 'ice', 'ice'],
        name: "Ice",
        cost: 4
    },
    'leaves_big_oak': {
        faces: ['leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak'],
        name: "Leaves Big Oak",
        cost: 1
    },
    'log_big_oak': {
        faces: ['log_big_oak_side', 'log_big_oak_side', 'log_big_oak_top', 'log_big_oak_top', 'log_big_oak_side', 'log_big_oak_side'],
        name: "Log Big Oak",
        cost: 1
    },
    'pumpkin': {
        faces: ['pumpkin_face_on', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
        name: "Pumpkin",
        cost: 5
    },
    'redstone_block': {
        faces: ['redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block'],
        name: "Redstone Block",
        cost: 4
    },
    'tnt': {
        faces: ['tnt_side', 'tnt_side', 'tnt_top', 'tnt_bottom', 'tnt_side', 'tnt_side'],
        name: "TNT",
        cost: 5
    },
    'under_water': {
        faces: ['under_water', 'under_water', 'under_water', 'under_water', 'under_water', 'under_water'],
        name: "Under Water",
        cost: 1
    }
}