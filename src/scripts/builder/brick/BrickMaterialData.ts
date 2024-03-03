type BrickMaterialsArray = [string, string, string, string, string, string];
export const BrickMaterialData: { [brick: string]: { faces: BrickMaterialsArray } } = {
    'pure': {
        // front back top bottom left right
        faces: ['pure', 'pure', 'pure', 'pure', 'pure', 'pure']
    },
    'beacon': {
        faces: ['beacon', 'beacon', 'beacon', 'beacon', 'beacon', 'beacon']
    }
}