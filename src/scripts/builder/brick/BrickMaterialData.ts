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
    }
}