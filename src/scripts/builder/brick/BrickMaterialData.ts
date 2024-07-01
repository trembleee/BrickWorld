type BrickMaterialsArray = [string, string, string, string, string, string];
export const BrickMaterialData: { [brick: string]: { faces: BrickMaterialsArray, name: string } } = {
    'pure': {
        // front back top bottom left right
        faces: ['pure', 'pure', 'pure', 'pure', 'pure', 'pure'],
        name: "CSSColorMaterial"
    },
    'beacon': {
        faces: ['beacon', 'beacon', 'beacon', 'beacon', 'beacon', 'beacon'],
        name: "Beacon"
    },
    'glass': {
        faces: ['glass', 'glass', 'glass', 'glass', 'glass', 'glass'],
        name: "Glass"
    },
    'red_brick': {
        faces: ['red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick', 'red_brick'],
        name: "Red Brick"
    },
    'cactus': {
        faces: ['cactus_side', 'cactus_side', 'cactus_top', 'cactus_bottom', 'cactus_side', 'cactus_side'],
        name: "Cactus"
    },
    'cobblestone': {
        faces: ['cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone', 'cobblestone'],
        name: "Cobblestone"
    },
    'cobblestone_mossy': {
        faces: ['cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy', 'cobblestone_mossy'],
        name: "Cobblestone Mossy"
    },
    'clay_with_grass': {
        faces: ['grass_side', 'grass_side', 'grass_top', 'dirt', 'grass_side', 'grass_side'],
        name: "Grass Clay"
    },
    'dirt': {
        faces: ['dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt'],
        name: "Dirt"
    },
    'furnace': {
        faces: ['furnace_front_on', 'furnace_side', 'furnace_top', 'furnace_top', 'furnace_side', 'furnace_side'],
        name: "Furnace"
    },
    'glowstone': {
        faces: ['glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone', 'glowstone'],
        name: "Glowstone"
    },
    'ice': {
        faces: ['ice', 'ice', 'ice', 'ice', 'ice', 'ice'],
        name: "Ice"
    },
    'leaves_big_oak': {
        faces: ['leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak', 'leaves_big_oak'],
        name: "Leaves Big Oak"
    },
    'log_big_oak': {
        faces: ['log_big_oak_side', 'log_big_oak_side', 'log_big_oak_top', 'log_big_oak_top', 'log_big_oak_side', 'log_big_oak_side'],
        name: "Log Big Oak"
    },
    'pumpkin': {
        faces: ['pumpkin_face_on', 'pumpkin_side', 'pumpkin_top', 'pumpkin_top', 'pumpkin_side', 'pumpkin_side'],
        name: "Pumpkin"
    },
    'redstone_block': {
        faces: ['redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block', 'redstone_block'],
        name: "Redstone Block"
    },
    'tnt': {
        faces: ['tnt_side', 'tnt_side', 'tnt_top', 'tnt_bottom', 'tnt_side', 'tnt_side'],
        name: "TNT"
    },
    'under_water': {
        faces: ['under_water', 'under_water', 'under_water', 'under_water', 'under_water', 'under_water'],
        name: "Under Water"
    }
}