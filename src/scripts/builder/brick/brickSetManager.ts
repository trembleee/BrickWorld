import { defaultModel, CONF } from '@/scripts/builder/conf/conf';
import { BrickSet, SerializedBrickSet } from "./brickSet";
import { logDebug } from "@/scripts/utils/Message";
import { hexUuid } from "./Uuid"
import { Brick } from './brick';

import { OakTreeModel } from '../conf/default';

export function loadOakTree() {
    const set = new BrickSet(OakTreeModel.id);
    set.deserialize(OakTreeModel as SerializedBrickSet);
    return set;
}

export function loadEmptySet() {
    const set = new BrickSet(hexUuid());
    set.name = 'Empty Set';
    return set;
}

export function generateDefaultSet() {
    logDebug(('BUILDER - INITIALIZING DEFAULT SET'));

    const set = new BrickSet(hexUuid());
    set.name = 'DefaultSet';
    const data = defaultModel;
    for (const brickData of data) {
        set.placeOrRemoveBrick(...brickData.pos, new Brick(brickData.material, brickData.color));
    }
    return set;
}

export function deserializeSet(info: SerializedBrickSet) {
    const set = new BrickSet(info.id as string);
    set.deserialize(info);
    return set;
}