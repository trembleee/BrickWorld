import { defaultModel, CONF } from '@/scripts/builder/conf/conf';
import { BrickSet } from "./brickSet";
import { logDebug } from "@/scripts/utils/Message";
import { hexUuid } from "./Uuid"
import { Brick } from './brick';

export function generateDefaultSet() {
    logDebug(('BUILDER - INITIALIZING DEFAULT SET'));

    const set = new BrickSet(hexUuid());
    set.name = 'DefaultSet';
    const data = defaultModel;
    for (const brickData of data) {
        set.placeBrick(...brickData.pos, new Brick(CONF.defaultMaterial, brickData.color));
    }
    return set;
}