import { BrickSet } from './../brick/brickSet';
import { Brick } from '../brick/brick';
import { threeSetupComplete } from '@/scripts/builder/render/three_loading';
import type { THREE as THREE_TYPE } from '@/scripts/builder/render/three';
import { inputStore } from '@/scripts/builder/inputs/InputStore';
import { logDebug } from '@/scripts/utils/Message';


let THREE: typeof THREE_TYPE;
threeSetupComplete.then(x => THREE = x as typeof THREE_TYPE);

// A BuilderAction acts on a set and has the following methods:
// - Allowed() - returns true if the action is allowed to be performed
// - Perform() - performs the action
// - Undo() - undoes the action
// - Redo() - redoes the action

export abstract class BuilderAction {
    allowed(set: BrickSet) {
        return true;
    }
    abstract undo(set: BrickSet): void;
    abstract redo(set: BrickSet): void;
}

function isWithinBounds(x: number, y: number, z: number) {
    const size = 10000;
    return x >= -size && x < size && y >= 0 && z >= -size && z < size;
}

export class RenameSet extends BuilderAction {
    payload;
    oldName;
    oldDesc;

    constructor(set: BrickSet, payload: { name: string } | { description: string }) {
        super();
        this.payload = payload;
        this.oldName = set.name;
        this.oldDesc = set.description;
        return this;
    }

    undo(set: BrickSet) {
        if (this.oldName)
            set.name = this.oldName;
        if (this.oldDesc)
            set.description = this.oldDesc;
    }

    redo(set: BrickSet) {
        if ('name' in this.payload)
            set.name = this.payload.name;
        if ('description' in this.payload)
            set.description = this.payload.description;
    }
}

export class PlaceOrRemoveBriqs extends BuilderAction {
    payload;
    oldData;

    constructor(set: BrickSet, payload: { pos: [number, number, number], color?: string, material?: string, id?: string, allow_overwrite?: boolean }[]) {
        super();
        this.payload = payload;
        for (const briqData of this.payload)
            if (briqData.color && !isWithinBounds(...briqData.pos))
                throw new Error('cannot');

        const cells = [];
        for (const data of this.payload) {
            const cell = set.getAt(...data.pos);
            cells.push({
                pos: data.pos,
                color: cell?.color,
                material: cell?.material,
                id: cell?.id,
                allow_overwrite: true,
            });
        }
        this.oldData = cells;
        return this;
    }

    undo(set: BrickSet) {
        // Because placeBriq can modify briqs & remove them, we just redo with the old data,
        // it's equivalent to removing then readding.
        this.redo(set, this.oldData);
    }

    redo(set: BrickSet, payload: typeof this['payload'] = this.payload) {
        for (const briqData of payload) {
            const cell = set.getAt(...briqData.pos);
            if (cell && briqData.color && !briqData.allow_overwrite)
                continue;
            const briq = briqData.color
                ? new Brick(briqData.material, briqData.color).setNFTid(briqData.id)
                : undefined;
            set.placeBrick(...briqData.pos, briq);
            // logDebug("Brick added.");
        }
        // inputStore.selectionMgr.clear();
        // dispatchBuilderAction("place_briqs", grphcs);
        // inputStore.selectionMgr.clear();
    }
}


// export class PaintBriqs extends BuilderAction {
//     payload;
//     oldColors;

//     constructor(set: SetData, payload: { pos: [number, number, number], color?: string, material?: string }[]) {
//         super();
//         this.payload = payload;
//         const colors = [];
//         for (const d of this.payload) {
//             const cell = set.getAt(...(d.pos as [number, number, number]));
//             if (cell)
//                 colors.push({ pos: d.pos, color: cell.color, material: cell.material });
//         }
//         this.oldColors = colors;
//         return this;
//     }

//     undo(set: SetData) {
//         for (const d of this.oldColors)
//             set.modifyBriq(...d.pos, d);
//     }

//     redo(set: SetData) {
//         for (const d of this.payload)
//             set.modifyBriq(...d.pos, d);
//     }
// }