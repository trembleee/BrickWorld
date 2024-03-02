import { MouseInputState } from './BuilderInputState';
// import getPreviewCube from '@/builder/graphics/PreviewCube';
import { inputStore } from '../InputStore';

import { THREE } from '@/scripts/builder/render/three';

import { watchEffect } from 'vue';
import { builderStore } from '@/scripts/builder/builderStore';
import { BrickGrid } from '../../brick/brickGrid';
import { PlaceOrRemoveBriqs } from '@/scripts/builder/render/BuilderActions';
import { logDebug } from '@/scripts/utils/Message';
// import { builderHistory } from '@/builder/BuilderHistory';

const { currentSet } = builderStore;


export class PlacerInput extends MouseInputState {
    onEnter() {
        // getPreviewCube().visible = false;
        // getPreviewCube().scale.set(1, 1, 1);

        // this.grid = new ShaderGrid();
        // this.grid.generate();
        // this.grid.grid.visible = false;
        // underlayObjects.add(this.grid.grid);
    }

    onExit() {
        // underlayObjects.remove(this.grid.grid);
        // getPreviewCube().visible = false;
    }

    // Overloaded - we want diagonal placement.
    getIntersectionPos(x: number, y: number, overlay = false): [number, number, number] | undefined {
        const intersection = this._getIntersectionPos(x, y, overlay);
        if (!intersection)
            return undefined;
        // This is the target without diagonal shenanigans.
        const naturalTarget = intersection.position.map((v, ndx) => {
            return Math.floor(v + intersection.normal[ndx] * (overlay ? -0.5 : +0.5));
        }) as [number, number, number];
        // If we're in overlay mode or there not hovering a briq, return the natural path.
        if (overlay || intersection.position[1] < 0.1)
            return naturalTarget;
        // Now in non-overlay mode (aka briq placement), we want to allow diagonals near edges.
        const diagTarget = intersection.position.map((v, ndx) => {
            const cubeCenter = Math.floor(v - intersection.normal[ndx] / 2) + 0.5;
            if (ndx === 1)
                return Math.max(0, Math.floor(cubeCenter + (v - cubeCenter) * 1.5));
            return Math.floor(cubeCenter + (v - cubeCenter) * 1.5);
        }) as [number, number, number];
        // Same cube, exit early.
        if (diagTarget[0] === naturalTarget[0] && diagTarget[1] === naturalTarget[1] && diagTarget[2] === naturalTarget[2])
            return naturalTarget;
        // Check that there isn't a briq at the diagonal target, otherwise return natural.
        if (currentSet.value.getAt(...diagTarget))
            return naturalTarget;
        // Different cube: compute the 'next natural briq', if there is one return natural,
        // otherwise we're at an edge and allow diagonals.
        const currentBriq = intersection.position.map((v, ndx) => {
            return Math.floor(v - intersection.normal[ndx] / 2);
        });
        if (!currentSet.value.getAt(...([0, 1, 2].map(i => currentBriq[i] + diagTarget[i] - naturalTarget[i])) as [number, number, number]))
            return diagTarget;
        return naturalTarget;
    }

    async onPointerMove(event: PointerEvent) {
        const pos = this.getIntersectionPos(this.curX, this.curY);
        if (!pos)
            return;
        // getPreviewCube().position.set(Math.floor(pos[0]) + 0.5, Math.floor(pos[1]) + 0.5, Math.floor(pos[2]) + 0.5);
        // this.grid.place(pos[0], 0, pos[2]);
        // if (this.isWithinBounds(...pos)) {
        //     getPreviewCube().visible = true;
        //     (getPreviewCube().material as THREE.MeshPhongMaterial).color = new THREE.Color(inputStore.currentColor);
        //     this.grid.grid.visible = true;
        // } else {
        //     getPreviewCube().visible = false;
        //     this.grid.grid.visible = false;
        // }
    }

    async onPointerDown(event: PointerEvent) {
        if (event.shiftKey)
            this.fsm.switchTo('place_multi', { x: event.clientX, y: event.clientY });
    }

    async onPointerUp(event: PointerEvent) {
        const mov = Math.abs(event.clientX - this.lastClickX) + Math.abs(event.clientY - this.lastClickY);
        if (mov > 10)
            return;

        const removing = event.button !== 0;
        const pos = this.getIntersectionPos(this.curX, this.curY, removing);
        if (!pos || !this.isWithinBounds(...pos))
            return;
        try {
            const data = removing
                ? { pos }
                : { pos, color: inputStore.currentColor, material: inputStore.currentMaterial };
            // builderHistory.push_command(PlaceOrRemoveBriqs, [data]);
            // builderHistory.push_checkpoint();
            const command = new PlaceOrRemoveBriqs(currentSet.value, [data]);
            command.redo(currentSet.value);
            // Update the preview cursor in a few milliseconds to let the world update.
            // Use the 'non event updating version' so the cube doesn't accidentally jump back.
            setTimeout(() => this.onPointerMove(event), 100);
        } catch (_) {
            logDebug("Error in Placer.ts PlacerInput onPointerUp func!");
        }
    }
}