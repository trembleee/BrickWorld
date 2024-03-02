import { MouseInputState } from './BuilderInputState';
import type { BrickSet } from '../../brick/brickSet';
import type { Brick } from '../../brick/brick';
import { THREE, BufferGeometryUtils } from '@/scripts/builder/render/three';

import { camera } from '@/scripts/builder/Builder';

import { watchEffect, WatchStopHandle } from 'vue';
import { inputStore } from '../InputStore';
import { builderStore } from '@/scripts/builder/builderStore';

const { currentSet } = builderStore;

export class InspectInput extends MouseInputState {
    declare gui: { briq: Brick | undefined; curX: number; curY: number; focusPos: THREE.Vector3 | undefined };

    lastClickPos: [number, number, number] | undefined;

    mesh!: THREE.Object3D;
    otherMesh!: THREE.Object3D;

    meshWatcher!: WatchStopHandle;

    // _canMove() {
    //     return (
    //         inputStore.showMoveGizmo &&
    //         setsManager.getInfo(currentSet.value.id)?.status !== 'ONCHAIN_LOADED'
    //     );
    // }

    // _canRotate() {
    //     return (
    //         inputStore.showRotateGizmo &&
    //         setsManager.getInfo(currentSet.value.id)?.status !== 'ONCHAIN_LOADED'
    //     );
    // }

    // _canCopyPaste() {
    //     return canCopyPaste(this.fsm);
    // }

    // override onEnter() {
    //     this.setGuiData({
    //         briq: undefined,
    //         curX: 0,
    //         curY: 0,
    //         focusPos: undefined,
    //     });
    //     // selectionRender.show();

    //     // Register the movement gizmo on the scene.
    //     // this.mesh = getMovementHelperMesh();
    //     // this.mesh.visible = this._canMove();
    //     // this.otherMesh = getRotationHelperMesh();
    //     // this.otherMesh.visible = this._canRotate();
    //     // overlayObjects.add(this.mesh);
    //     // overlayObjects.add(this.otherMesh);

    //     // Update the movement gizmo when needed.
    //     // this.meshWatcher = watchEffect(() => {
    //     //     // Reactivity trigger so that getCenterPos gets recomputed properly.
    //     //     currentSet.value.bricks_;
    //     //     // const avgPos = this.fsm.store.selectionMgr.getCenterPos();
    //     //     // this.gui.focusPos = avgPos;
    //     //     // this.mesh.visible = !!avgPos && this._canMove();
    //     //     // this.otherMesh.visible = !!avgPos && this._canRotate();
    //     //     // if (avgPos) {
    //     //     //     this.mesh.position.set(avgPos.x, avgPos.y, avgPos.z);
    //     //     //     this.otherMesh.position.set(avgPos.x, avgPos.y, avgPos.z);
    //     //     // }
    //     // });

    //     this.fsm.hotkeyMgr.register('copy', { code: 'KeyC', ctrl: true, onDown: true });
    //     this.copyHotkey = this.fsm.hotkeyMgr.subscribe('copy', () =>
    //         this._canCopyPaste() ? this.fsm.switchTo('copy') : null,
    //     );
    //     // See also MenuBuilder's shortcut.
    //     this.fsm.hotkeyMgr.register('paste', { code: 'KeyV', ctrl: true, onDown: true });
    //     this.pasteHotkey = this.fsm.hotkeyMgr.subscribe('paste', () =>
    //         this._canCopyPaste() ? this.fsm.switchTo('copy_paste') : null,
    //     );

    //     this.fsm.hotkeyMgr.register('new', { code: 'KeyN', ctrl: true, onDown: true });
    //     this.newHotkey = this.fsm.hotkeyMgr.subscribe('new', () =>
    //         this.createNewSetWithSelection(),
    //     );
    // }

    // override onExit() {
    //     // Drop the watcher.
    //     this.meshWatcher();
    //     this.gui.briq = undefined;
    //     selectionRender.hide();
    //     overlayObjects.remove(this.mesh);
    //     overlayObjects.remove(this.otherMesh);
    //     this.fsm.hotkeyMgr.unsubscribe(this.copyHotkey);
    //     this.fsm.hotkeyMgr.unsubscribe(this.pasteHotkey);
    //     this.fsm.hotkeyMgr.unsubscribe(this.newHotkey);
    // }

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

        // if (this._canMove() || this._canRotate()) {
        //     const rc = new THREE.Raycaster();
        //     rc.setFromCamera(
        //         {
        //             x: (event.clientX / window.innerWidth - 0.5) * 2,
        //             y: -(event.clientY / window.innerHeight - 0.5) * 2,
        //         },
        //         camera,
        //     );
        //     const avgPos = this.fsm.store.selectionMgr.getCenterPos();
        //     let objects = rc.intersectObject(this.mesh, true);
        //     if (objects.length && this.mesh.visible)
        //         document.body.style.cursor = 'grab';
        //     else {
        //         objects = rc.intersectObject(this.otherMesh, true);
        //         if (objects.length && this.otherMesh.visible)
        //             document.body.style.cursor = 'grab';
        //         else
        //             document.body.style.cursor = 'auto';
        //     }
        // } else
        {
            document.body.style.cursor = 'auto';
        }
    }

    async onPointerDown(event: PointerEvent) {
        // if (this._canMove() || this._canRotate()) {
        //     const rc = new THREE.Raycaster();
        //     rc.setFromCamera(
        //         {
        //             x: (event.clientX / window.innerWidth - 0.5) * 2,
        //             y: -(event.clientY / window.innerHeight - 0.5) * 2,
        //         },
        //         camera,
        //     );
        //     const avgPos = this.fsm.store.selectionMgr.getCenterPos();
        //     let objects = rc.intersectObject(this.mesh, true);
        //     if (objects.length && this.mesh.visible) {
        //         this.fsm.switchTo('drag', {
        //             x: event.clientX,
        //             y: event.clientY,
        //             startPos: avgPos,
        //             direction: objects[0].object.userData.dir,
        //         });
        //         return;
        //     }
        //     objects = rc.intersectObject(this.otherMesh, true);
        //     if (objects.length && this.otherMesh.visible) {
        //         this.fsm.switchTo('rotate', {
        //             x: event.clientX,
        //             y: event.clientY,
        //             startPos: avgPos,
        //             direction: objects[0].object.userData.dir,
        //         });
        //         return;
        //     }
        // }

        // if (event.altKey || event.shiftKey) {
        //     const mode =
        //         this.fsm.store.defaultSelectionMethod === 'BOX'
        //             ? event.altKey
        //                 ? 'inspect_va'
        //                 : 'inspect_box'
        //             : event.altKey
        //                 ? 'inspect_box'
        //                 : 'inspect_va';
        //     this.fsm.switchTo(mode, { switchBackTo: 'inspect', x: event.clientX, y: event.clientY });
        //     return;
        // }
        // If we're over a briq
        // if (this.gui.briq && event.button === 0)
        //     this.fsm.switchTo('inspect_spray', { x: event.clientX, y: event.clientY });
    }

    async onPointerUp(event: PointerEvent) {
        const mov = Math.abs(event.clientX - this.lastClickX) + Math.abs(event.clientY - this.lastClickY);
        if (mov > 10)
            return;

        const pos = this.getIntersectionPos(this.curX, this.curY, true);
        // if (event.button === 2)
        //     if (!pos || pos[1] < 0)
        //         this.fsm.store.selectionMgr.clear();
        //     else
        //         this.fsm.store.selectionMgr.remove(...pos);
        // else
        //     if (!pos || pos[1] < 0)
        //         this.fsm.store.selectionMgr.clear();
        //     else
        //         this.fsm.store.selectionMgr.add(...pos);
    }

    // createNewSetWithSelection() {
    //     const newSet = setsManager.createLocalSet();
    //     for (const briq of this.fsm.store.selectionMgr.selectedBriqs)
    //         newSet.placeBriq(...briq.position, briq);
    //     openSetInBuilder(newSet.id, true);
    // }
}