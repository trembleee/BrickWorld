import { MaterialByColor } from "./MaterialByColor";
import { Material, MaterialInitStruct } from "./Material";
import { MaterialMetaData } from "@/scripts/builder/materials/MaterialMetaData";
import { logDebug } from "@/scripts/utils/Message";

export const materialMap: { [material: string]: Material } = {};

export function getFaceRenderMaterial(material: string) {
    let ret = materialMap[material];
    // console.log("Material:", material);

    if (!ret) {
        const info: MaterialInitStruct = MaterialMetaData[material];
        // console.log("MaterialMetaData:", info);
        if (info?.pure) {
            materialMap[material] = ret = new MaterialByColor(info);
        }
        else {
            materialMap[material] = ret = new Material(info);
        }
        logDebug("Material instantialized:", material);
    }
    return ret;
}
