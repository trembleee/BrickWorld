import { MouseInputState } from './BuilderInputState';
import type { BrickSet } from '../../brick/brickSet';
import type { Brick } from '../../brick/brick';
import { THREE, BufferGeometryUtils } from '@/scripts/builder/render/three';

import { camera } from '@/scripts/builder/Builder';

import { watchEffect, WatchStopHandle } from 'vue';
import { inputStore } from '../InputStore';
import { builderStore } from '@/scripts/builder/BuilderStore';

const { currentSet } = builderStore;

export class InspectInput extends MouseInputState {
    declare gui: { briq: Brick | undefined; curX: number; curY: number; focusPos: THREE.Vector3 | undefined };

    lastClickPos: [number, number, number] | undefined;

    mesh!: THREE.Object3D;
    otherMesh!: THREE.Object3D;

    meshWatcher!: WatchStopHandle;

    override async onFrame() {
        let distance = camera.position.distanceTo(this.mesh.position);
        distance *= (camera as THREE.PerspectiveCamera).fov / 45;
        this.mesh.scale.setScalar(Math.max(1, distance / 30.0));
        this.otherMesh.scale.setScalar(Math.max(1, distance / 30.0));
    }

    async onPointerMove(event: PointerEvent) {
        this.gui.curX = this.curX;
        this.gui.curY = this.curY;

        const pos = this.getIntersectionPos(this.curX, this.curY, true);
        // If the position is on the ground then there's no cube, and vice-versa.
        if (!pos || pos[1] < 0)
            this.gui.briq = undefined;
        else
            this.gui.briq = (currentSet.value as BrickSet).getAt(...pos);
    }

    async onPointerDown(event: PointerEvent) {

    }

    async onPointerUp(event: PointerEvent) {

    }

}