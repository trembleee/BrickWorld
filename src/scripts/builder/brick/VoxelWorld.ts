import { THREE } from '@/scripts/builder/render/three';

import type { MaterialByColor } from '@/scripts/builder/materials/MaterialByColor';
import { getRenderMaterial } from '../materials/MaterialMap';
import { BrickType, getBrickMaterials } from './BrickType';
import { logDebug } from '@/scripts/utils/Message';

export class VoxelWorld {
    cellSize: number;
    material: MaterialByColor;
    cellSliceSize: number; // A cell contains multiple bricks, namely voxels, each brick has one unit width
    // cells: { [cellId: string]: Uint16Array }; // Map<number, Uint8Array>;
    cells: { [cellId: string]: Array<[string, number]> }; // Map<cellId, [brickType, colorIdx]>;
    cellIdToMesh: { [cellId: string]: THREE.Mesh };

    dirtyCells: Set<string>;

    object: THREE.Object3D;

    static faces: Array<any>;
    static getFaceIndexFromDir: (dir: THREE.Vector3) => number;

    constructor(options: { cellSize: number }) {
        this.cellSize = options.cellSize;
        const { cellSize } = this;
        this.cellSliceSize = cellSize * cellSize;
        this.cells = {};
        this.cellIdToMesh = {};

        this.dirtyCells = new Set();

        this.object = new THREE.Object3D();

        this.material = getRenderMaterial('pure') as MaterialByColor;
    }

    reset() {
        const cells = this.cells;
        this.cells = {};
        // Geometry operations' entry
        for (const cell in cells)
            this.updateCellGeometry(...cell.split(',').map((x) => +x * this.cellSize) as [number, number, number]);
    }

    updateDirty() {
        this.dirtyCells.forEach((x) => this.updateCellGeometry(...x.split(',').map((x) => +x * this.cellSize) as [number, number, number]));
        this.dirtyCells.clear();
    }

    computeVoxelOffset(x: number, y: number, z: number) {
        const { cellSize, cellSliceSize } = this;
        const voxelX = THREE.MathUtils.euclideanModulo(x, cellSize) | 0;
        const voxelY = THREE.MathUtils.euclideanModulo(y, cellSize) | 0;
        const voxelZ = THREE.MathUtils.euclideanModulo(z, cellSize) | 0;
        return voxelY * cellSliceSize + voxelZ * cellSize + voxelX;
    }

    _computeCellCoords(x: number, y: number, z: number) {
        return [Math.floor(x / this.cellSize), Math.floor(y / this.cellSize), Math.floor(z / this.cellSize)];
    }

    computeCellId(x: number, y: number, z: number) {
        const [cellX, cellY, cellZ] = this._computeCellCoords(x, y, z);
        return `${cellX},${cellY},${cellZ}`;
    }

    getAABB() {
        const min = [0, 0, 0];
        const max = [0, 0, 0];
        for (const cell in this.cells) {
            const pos = cell.split(',').map((i) => +i) as [number, number, number];
            if (pos[0] < min[0])
                min[0] = pos[0];
            if (pos[0] > max[0])
                max[0] = pos[0];
            if (pos[1] < min[1])
                min[1] = pos[1];
            if (pos[1] > max[1])
                max[1] = pos[1];
            if (pos[2] < min[2])
                min[2] = pos[2];
            if (pos[2] > max[2])
                max[2] = pos[2];
        }
        return [min.map((i) => i * this.cellSize), max.map((i) => (i + 1) * this.cellSize)];
    }

    addCellForVoxel(x: number, y: number, z: number) {
        const cellId = this.computeCellId(x, y, z);
        let cell = this.cells[cellId];
        if (!cell) {
            const { cellSize } = this;
            cell = new Array<[string, number]>(cellSize * cellSize * cellSize);
            this.cells[cellId] = cell;
        }
        return cell;
    }

    getCellForVoxel(x: number, y: number, z: number) {
        return this.cells[this.computeCellId(x, y, z)];
    }

    // client entry to add cells to the voxelWorld
    setVoxel(x: number, y: number, z: number, color: string, brickType: string = 'pure', addCell = true) {
        let cell = this.getCellForVoxel(x, y, z);
        if (!cell) {
            if (!addCell)
                return;

            cell = this.addCellForVoxel(x, y, z);
        }
        // compute offset within the Cell, since cellsSize used
        const voxelOffset = this.computeVoxelOffset(x, y, z);
        // material by color
        // TODO: map material
        const colorIndex = this.material.getIndex(color);
        // unique in the cell Uint16Array
        // Delete here ---- in origin version, if color === '', get index - 0, cell[voxelOffset] is set to 0!
        if (addCell) {
            // add
            cell[voxelOffset] = [brickType, colorIndex];
        }
        else {
            // delete
            cell[voxelOffset] = undefined as unknown as [string, number];
        }

        this.dirtyCells.add(this.computeCellId(x, y, z));
        // We might need to update neighboring regions because the meshes are optimised (no inside faces).
        this.dirtyCells.add(this.computeCellId(x - 1, y - 1, z - 1));
        this.dirtyCells.add(this.computeCellId(x - 1, y - 1, z + 1));
        this.dirtyCells.add(this.computeCellId(x - 1, y + 1, z - 1));
        this.dirtyCells.add(this.computeCellId(x - 1, y + 1, z + 1));
        this.dirtyCells.add(this.computeCellId(x + 1, y - 1, z + 1));
        this.dirtyCells.add(this.computeCellId(x + 1, y - 1, z - 1));
        this.dirtyCells.add(this.computeCellId(x + 1, y + 1, z + 1));
        this.dirtyCells.add(this.computeCellId(x + 1, y + 1, z - 1));
    }

    getVoxel(x: number, y: number, z: number) {
        const cell = this.getCellForVoxel(x, y, z);
        if (!cell)
            return 0;

        const voxelOffset = this.computeVoxelOffset(x, y, z);
        return cell[voxelOffset];
    }

    generateGeometryDataForCell(cellX: number, cellY: number, cellZ: number) {
        const { cellSize } = this;

        const positions = [];
        const normals = [];
        const uvs = [];
        const uv2s = [];
        const indices = [];
        const cellMaterialaArray = [];
        const startX = cellX * cellSize; // turn into world pos, origin
        const startY = cellY * cellSize;
        const startZ = cellZ * cellSize;

        for (let y = 0; y < cellSize; ++y) {
            const voxelY = startY + y;
            for (let z = 0; z < cellSize; ++z) {
                const voxelZ = startZ + z;
                for (let x = 0; x < cellSize; ++x) {
                    const voxelX = startX + x;
                    // in fact, we get the color of the voxel
                    const voxel = this.getVoxel(voxelX, voxelY, voxelZ);
                    if (voxel) {
                        logDebug("-------------- Start placing voxel -----------------");
                        // voxel 0 is sky (empty) so for UVs we start at 0
                        const uvVoxel = voxel[1] - 1;
                        const brickType = voxel[0];
                        logDebug("BrickType:", brickType);
                        const voxelMaterials = getBrickMaterials(brickType);
                        // There is a voxel here but do we need faces for it?
                        for (const i in VoxelWorld.faces) {
                            const { dir, corners, uvRow } = VoxelWorld.faces[i];
                            const neighbor = this.getVoxel(voxelX + dir[0], voxelY + dir[1], voxelZ + dir[2]);

                            // neighbor material infos
                            let neighborMaterials = null;
                            const neighborFaceIndex = VoxelWorld.getFaceIndexFromDir(new THREE.Vector3(...dir.map((x: number) => x * -1)));
                            if (neighbor) {
                                // logDebug(dir.map((x: number) => x * -1));
                                // logDebug("Neighbor exist with facce index - " + neighborFaceIndex);
                                neighborMaterials = getBrickMaterials(neighbor[0]);
                            }

                            const neighborMaterial = neighborMaterials ? neighborMaterials[neighborFaceIndex] : null;
                            const voxelMaterial = voxelMaterials ? voxelMaterials[i] : null;

                            // totally 24 for a cube, indexed in a face, the vertex between face/edge is repeated
                            if (!neighbor || (neighborMaterial && neighborMaterial.material.transparent && neighbor !== voxel && !(voxelMaterial?.material.transparent && neighborMaterial?.material.transparent))) {
                                // this voxel has no neighbor in this direction so we need a face.
                                const ndx = positions.length / 3;
                                for (const { pos, uv } of corners) {
                                    // offset in cell
                                    positions.push(pos[0] + x, pos[1] + y, pos[2] + z);
                                    normals.push(...dir);
                                    if (brickType === 'pure') {
                                        uvs.push(...this.material.getUV(uvVoxel, uv));
                                    }
                                    else {
                                        uvs.push(...uv);
                                    }
                                    uv2s.push(...uv);
                                }
                                // every 6 indices with a material
                                cellMaterialaArray.push(voxelMaterials[i].material);
                                indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
                            }
                        }
                        logDebug("-------------- End placing voxel -----------------");
                    }
                }
            }
        }

        return {
            positions,
            normals,
            uvs,
            uv2s,
            indices,
            materials: cellMaterialaArray
        };
    }

    updateCellGeometry(x: number, y: number, z: number) {
        // [x, y, z] are world space coords, decomposed from CellId
        const cellX = Math.floor(x / this.cellSize);
        const cellY = Math.floor(y / this.cellSize);
        const cellZ = Math.floor(z / this.cellSize);
        const cellId = this.computeCellId(x, y, z); // get CellId from coords again
        let mesh = this.cellIdToMesh[cellId];

        // why are we still using the old geometry?
        const geometry = mesh ? mesh.geometry : new THREE.BufferGeometry();
        // const geometry = new THREE.BufferGeometry();
        geometry.clearGroups();

        // every time regenerate geometry info from scratch when model altered
        const { positions, normals, uvs, uv2s, indices, materials } = this.generateGeometryDataForCell(cellX, cellY, cellZ); // the start point of a cell, namely origin of a cell

        const positionNumComponents = 3;
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(new Float32Array(positions), positionNumComponents),
        );

        const normalNumComponents = 3;
        geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), normalNumComponents));

        const uvNumComponents = 2;
        // this uv is used to lookup pure color, this item is fixed for specific brick
        geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), uvNumComponents));
        geometry.setAttribute('uv2', new THREE.BufferAttribute(new Float32Array(uv2s), uvNumComponents));
        geometry.setIndex(indices);
        geometry.computeBoundingSphere();

        const matNumComponentsForAFace = 6;
        for (let i = 0; i < materials.length; i++) {
            geometry.addGroup(i * matNumComponentsForAFace, matNumComponentsForAFace, i);
        }

        if (!mesh) {
            mesh = new THREE.Mesh(geometry, materials);
            mesh.name = cellId;
            this.cellIdToMesh[cellId] = mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // The geometry has a inner offset in the cell, with this can it get to the real pos.
            // offset out cell
            mesh.position.set(cellX * this.cellSize, cellY * this.cellSize, cellZ * this.cellSize);
            this.object.add(mesh);
        }
        else {
            mesh.material = materials;
        }
    }

    updateVoxelGeometry(x: number, y: number, z: number) {
        const neighborOffsets = [
            [0, 0, 0], // self
            [-1, 0, 0], // left
            [1, 0, 0], // right
            [0, -1, 0], // down
            [0, 1, 0], // up
            [0, 0, -1], // back
            [0, 0, 1], // front
        ];

        const updatedCellIds: { [cellId: string]: boolean } = {};
        for (const offset of neighborOffsets) {
            const ox = x + offset[0];
            const oy = y + offset[1];
            const oz = z + offset[2];
            const cellId = this.computeCellId(ox, oy, oz);
            if (!updatedCellIds[cellId]) {
                updatedCellIds[cellId] = true;
                this.updateCellGeometry(ox, oy, oz);
            }
        }
    }

    // from
    // http://www.cse.chalmers.se/edu/year/2010/course/TDA361/grid.pdf
    intersectRay(start: THREE.Vector3, end: THREE.Vector3): null | { position: [number, number, number], normal: [number, number, number], voxel?: number } /*voxel refers to a color index here*/ {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let dz = end.z - start.z;
        const lenSq = dx * dx + dy * dy + dz * dz;
        const len = Math.sqrt(lenSq);

        dx /= len;
        dy /= len;
        dz /= len;

        let t = 0.0;
        let ix = Math.floor(start.x);
        let iy = Math.floor(start.y);
        let iz = Math.floor(start.z);

        const stepX = dx > 0 ? 1 : -1;
        const stepY = dy > 0 ? 1 : -1;
        const stepZ = dz > 0 ? 1 : -1;

        const txDelta = Math.abs(1 / dx);
        const tyDelta = Math.abs(1 / dy);
        const tzDelta = Math.abs(1 / dz);

        const xDist = stepX > 0 ? ix + 1 - start.x : start.x - ix;
        const yDist = stepY > 0 ? iy + 1 - start.y : start.y - iy;
        const zDist = stepZ > 0 ? iz + 1 - start.z : start.z - iz;

        // location of nearest voxel boundary, in units of t
        let txMax = txDelta < Infinity ? txDelta * xDist : Infinity;
        let tyMax = tyDelta < Infinity ? tyDelta * yDist : Infinity;
        let tzMax = tzDelta < Infinity ? tzDelta * zDist : Infinity;

        let steppedIndex = -1;

        // main loop along raycast vector
        while (t <= len) {
            const voxel = this.getVoxel(ix, iy, iz);
            if (voxel || (start.y >= 0 && iy < 0))
                return {
                    position: [start.x + t * dx, start.y + t * dy, start.z + t * dz],
                    normal: [
                        steppedIndex === 0 ? -stepX : 0,
                        steppedIndex === 1 ? -stepY : 0,
                        steppedIndex === 2 ? -stepZ : 0,
                    ],
                    // voxel,
                };


            // advance t to next nearest voxel boundary
            if (txMax < tyMax)
                if (txMax < tzMax) {
                    ix += stepX;
                    t = txMax;
                    txMax += txDelta;
                    steppedIndex = 0;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }
            else
                if (tyMax < tzMax) {
                    iy += stepY;
                    t = tyMax;
                    tyMax += tyDelta;
                    steppedIndex = 1;
                } else {
                    iz += stepZ;
                    t = tzMax;
                    tzMax += tzDelta;
                    steppedIndex = 2;
                }

        }
        return null;
    }
}

VoxelWorld.faces = [
    {
        // front
        uvRow: 0,
        dir: [0, 0, 1],
        corners: [
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 1, 1], uv: [0, 1] },
            { pos: [1, 1, 1], uv: [1, 1] },
        ],
    },
    {
        // back
        uvRow: 0,
        dir: [0, 0, -1],
        corners: [
            { pos: [1, 0, 0], uv: [0, 0] },
            { pos: [0, 0, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 1] },
        ],
    },
    {
        // top
        uvRow: 2,
        dir: [0, 1, 0],
        corners: [
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [0, 1, 0], uv: [1, 0] },
            { pos: [1, 1, 0], uv: [0, 0] },
        ],
    },
    {
        // bottom
        uvRow: 1,
        dir: [0, -1, 0],
        corners: [
            { pos: [1, 0, 1], uv: [1, 0] },
            { pos: [0, 0, 1], uv: [0, 0] },
            { pos: [1, 0, 0], uv: [1, 1] },
            { pos: [0, 0, 0], uv: [0, 1] },
        ],
    },
    {
        // left
        uvRow: 0,
        dir: [-1, 0, 0],
        corners: [
            { pos: [0, 1, 0], uv: [0, 1] },
            { pos: [0, 0, 0], uv: [0, 0] },
            { pos: [0, 1, 1], uv: [1, 1] },
            { pos: [0, 0, 1], uv: [1, 0] },
        ],
    },
    {
        // right
        uvRow: 0,
        dir: [1, 0, 0],
        corners: [
            { pos: [1, 1, 1], uv: [0, 1] },
            { pos: [1, 0, 1], uv: [0, 0] },
            { pos: [1, 1, 0], uv: [1, 1] },
            { pos: [1, 0, 0], uv: [1, 0] },
        ],
    },
];


VoxelWorld.getFaceIndexFromDir = function (dir: THREE.Vector3): number {
    if (dir.equals(new THREE.Vector3(0, 0, 1))) return 0;
    if (dir.equals(new THREE.Vector3(0, 0, -1))) return 0;
    if (dir.equals(new THREE.Vector3(0, 1, 0))) return 1;
    if (dir.equals(new THREE.Vector3(0, -1, 0))) return 2;
    if (dir.equals(new THREE.Vector3(0, 0, -1))) return 3;
    if (dir.equals(new THREE.Vector3(-1, 0, 0))) return 4;
    if (dir.equals(new THREE.Vector3(1, 0, 0))) return 5;
    return 6;
}