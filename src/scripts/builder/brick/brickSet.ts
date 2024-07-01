import { Brick, SerializedBrick } from "./brick";
import { markRaw } from 'vue';
import { dispatchBuilderAction } from '@/scripts/builder/render/dispatchAction'
import { logDebug } from "@/scripts/utils/Message";
import { type_place_brick_payload, type_remove_brick_payload } from "@/scripts/builder/render/dispatchAction";

// import { dispatchBuilderAction } from '@/builder/graphics/Dispatch';
export class SerializedBrickSet {
    id?: string;
    name?: string;
    description?: string;
    regionSize?: number;
    version?: number;
    bricks: { pos: [number, number, number], data: SerializedBrick }[] = [];

    constructor(id?: string,
        name?: string,
        description?: string,
        regionSize?: number,
        version?: number,
        bricks?: { pos: [number, number, number], data: SerializedBrick }[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.regionSize = regionSize;
        this.version = version;
        this.bricks = bricks || [];
    }

    copy(): SerializedBrickSet {
        const newObject = new SerializedBrickSet();
        newObject.id = this.id;
        newObject.name = this.name;
        newObject.description = this.description;
        newObject.regionSize = this.regionSize;
        newObject.version = this.version;

        const newBricks = [];
        for (const brick of this.bricks) {
            const newPos: [number, number, number] = [brick.pos[0], brick.pos[1], brick.pos[2]];
            const newData: SerializedBrick = brick.data.copy();
            const newBrick: { pos: [number, number, number], data: SerializedBrick } = { pos: newPos, data: newData };
            newBricks.push(newBrick);
        }
        newObject.bricks = newBricks;
        return newObject;
    }
}

const REGION_SIZE = 100000;
export class BrickSet {
    id: string;
    name: string;
    description: string;

    regionSize: number;
    // Indexed by region & cell
    bricks!: Map<number, Map<number, Brick>>;

    usedByMaterial!: { [key: string]: number };

    // Region/Cell ID of each brick, by ID
    // brickPos: Map<string, [number, number]>;

    bricks_!: number;
    usedByMaterial_!: number;

    constructor(id: string) {
        this.id = id;
        this.name = '';
        this.description = 'A set made of bricks';

        this.regionSize = REGION_SIZE;
        this.reset();
    }

    reset() {
        // For performance reasons, the maps are not reactive.
        // However, setData increments bricks_/usedByMaterial_ when those change, so you can react to that.
        this.bricks = markRaw(new Map());
        this.bricks_ = 0;
        this.usedByMaterial = markRaw({});
        this.usedByMaterial_ = 0;
    }

    serialize() {
        const ret: SerializedBrickSet = new SerializedBrickSet();
        ret.id = this.id;
        ret.name = this.name;
        ret.description = this.description;
        ret.regionSize = this.regionSize;
        // ret.version = SET_DATA_VERSION;

        ret.bricks = [];
        this.bricks.forEach((region, regionId) => {
            region.forEach((cell, cellPos) => {
                const data = {
                    pos: this.to3DPos(regionId, cellPos),
                    data: cell.serialize(),
                };
                ret.bricks.push(data);
            });
        });
        // Reactivity
        this.bricks_;
        this.usedByMaterial_;

        return ret;
    }

    deserialize(data: SerializedBrickSet): BrickSet {
        if (data.id && this.id !== data.id)
            throw new Error('Set tried to load data from the wrong set');
        this.reset();
        this.name = data?.name || "";
        this.description = data?.description || '';
        this.regionSize = data?.regionSize || REGION_SIZE;
        const version = data?.version;
        for (const brick of data.bricks) {
            const cell = new Brick();
            cell.deserialize(brick.data);
            this.placeOrRemoveBrick(brick.pos[0], brick.pos[1], brick.pos[2], cell);
        }
        return this;
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    getName() {
        return this.name || this.id;
    }

    forEach(callable: (cell: Brick, pos: [number, number, number]) => any) {
        this.bricks_;
        this.bricks.forEach((region, regionId) => {
            region.forEach((brick, cellPos) => {
                //let pos = this.to3DPos(regionId, cellPos);
                callable(brick, brick.position!);
            });
        });
    }

    getNbBricks() {
        this.bricks_;
        let nb = 0;
        this.bricks.forEach((region, _) => (nb += region.size));
        return nb;
    }

    getAllBricks() {
        this.bricks_;
        const ret = [] as Brick[];
        this.bricks.forEach((region, regionId) => {
            region.forEach((brick, _) => ret.push(brick));
        });
        return ret;
    }

    getAt(x: number, y: number, z: number): Brick | undefined {
        this.bricks_;
        const [regionId, cellId] = this.computeIDs(x, y, z);
        if (!this.bricks.has(regionId))
            return;
        return this.bricks.get(regionId)!.get(cellId);
    }

    // _swapBrick(pos: [number, number, number], brick: Brick) {
    //     const [regionId, cellId] = this.computeIDs(...pos);
    //     const og = this.bricks.get(regionId)?.get(cellId);
    //     if (!og)
    //         throw new Error(`Could not find original brick at ${this.to3DPos(regionId, cellId)}`);
    //     this.bricks.get(regionId)?.set(cellId, brick);
    //     brick.position = pos;
    //     og.position = undefined;
    //     this.bricks_ += 1;
    //     dispatchBuilderAction('place_brick', { set: this.id, brick: brick.serialize(), position: pos });
    //     if (og.getMaterial() === brick.getMaterial())
    //         return;
    //     --this.usedByMaterial[og.getMaterial()];
    //     ++this.usedByMaterial[brick.getMaterial()];
    //     this.usedByMaterial_ += 1;
    // }

    // modifyBrick(x: number, y: number, z: number, data: any) {
    //     const cell = this.getAt(x, y, z);
    //     if (!cell)
    //         throw new Error(`No cell at position ${x}, ${y}, ${z}`);
    //     if (data.color)
    //         cell.color = data.color;
    //     if (data.material) {
    //         --this.usedByMaterial[cell.material];
    //         ++this.usedByMaterial[data.material];
    //         cell.material = data.material;
    //     }
    //     this.bricks_ += 1;
    //     dispatchBuilderAction('remove_brick', { set: this.id, position: [x, y, z] });
    //     dispatchBuilderAction('place_brick', { set: this.id, brick: cell.serialize(), position: [x, y, z] });
    // }

    placeOrRemoveBrick(x: number, y: number, z: number, brick?: Brick): boolean {
        if (brick) {
            // logDebug("BrickSet - placing a brick.");
            return this.doPlaceBrick(x, y, z, brick);
        }
        else {
            logDebug("BrickSet - removing a brick.");
            return this.doRemoveBrick(x, y, z);
        }
    }

    doPlaceBrick(x: number, y: number, z: number, brick: Brick): boolean {
        const [regionId, cellId] = this.computeIDs(x, y, z);
        // logDebug("x: " + x + " y: " + y + " z: " + z);
        // logDebug("regionId: " + regionId + " cellId " + cellId);
        if (!this.bricks.has(regionId))
            this.bricks.set(regionId, new Map());
        else if (this.bricks.get(regionId)?.get(cellId))
            this.doRemoveBrick(x, y, z);

        this.bricks.get(regionId)!.set(cellId, brick);
        brick.position = [x, y, z];

        if (!this.usedByMaterial[brick.material])
            this.usedByMaterial[brick.material] = 0;
        ++this.usedByMaterial[brick.material];

        this.bricks_ += 1;
        this.usedByMaterial_ += 1;

        const payload: type_place_brick_payload = { setId: this.id, brick: brick.serialize(), pos: [x, y, z] };
        dispatchBuilderAction('place_brick', payload);

        return true;
    }

    doRemoveBrick(x: number, y: number, z: number): boolean {
        const [regionId, cellId] = this.computeIDs(x, y, z);
        if (!this.bricks.has(regionId))
            return true;
        const brick = this.bricks.get(regionId)!.get(cellId);
        if (!brick)
            return true;

        if (brick.material)
            --this.usedByMaterial[brick.material];

        this.bricks.get(regionId)!.delete(cellId);
        brick.position = undefined;

        this.bricks_ += 1;
        this.usedByMaterial_ += 1;

        const payload: type_remove_brick_payload = { setId: this.id, pos: [x, y, z], brick: { id: brick.id } };
        dispatchBuilderAction('remove_brick', payload);

        return true;
    }

    // moveBricks(x: number, y: number, z: number, bricks: Brick[]) {
    //     // Not the best algo I think but it's OK.
    //     this.forEach((brick, pos) => {
    //         brick._ex_pos = brick.position!.slice();
    //     });
    //     bricks.forEach((brick) => {
    //         brick.position![0] += x;
    //         brick.position![1] += y;
    //         brick.position![2] += z;
    //     });
    //     const ret = new Map();
    //     this.forEach((brick) => {
    //         const [regionId, cellId] = this.computeIDs(brick.position[0], brick.position[1], brick.position[2]);
    //         if (!ret.has(regionId))
    //             ret.set(regionId, new Map());
    //         if (ret.get(regionId).get(cellId)) {
    //             this.forEach((brick, pos) => {
    //                 brick.position = brick._ex_pos;
    //             });
    //             this.bricks_ += 1;
    //             throw new Error('brick already placed on cell');
    //         }
    //         ret.get(regionId).set(cellId, brick);
    //     });
    //     this.bricks = markRaw(ret);
    //     this.bricks_ += 1;
    // }

    computeRegionId(x: number, y: number, z: number) {
        return (
            Math.floor(x / this.regionSize) +
            Math.floor(y / this.regionSize) * this.regionSize +
            Math.floor(z / this.regionSize) * this.regionSize * this.regionSize
        );
    }

    computeIDs(x: number, y: number, z: number): [number, number] {
        const rx: number = Math.floor(x / this.regionSize);
        const ry: number = Math.floor(y / this.regionSize);
        const rz: number = Math.floor(z / this.regionSize);

        const cx: number = x - rx * this.regionSize;
        const cy: number = y - ry * this.regionSize;
        const cz: number = z - rz * this.regionSize;

        // map minus to odds
        const mapN = (val: number) => Math.abs(val) * 2 + +(val < 0);

        return [
            mapN(rx) + mapN(ry) * (this.regionSize * 2) + mapN(rz) * (this.regionSize * this.regionSize * 4),
            cx + cy * this.regionSize + cz * this.regionSize * this.regionSize,
        ];
    }

    to3DPos(regionId: number, cellId: number): [number, number, number] {
        let mz = Math.floor(regionId / this.regionSize / this.regionSize / 4);
        let my = Math.floor((regionId - mz * this.regionSize * this.regionSize * 4) / this.regionSize / 2);
        let mx = regionId - mz * this.regionSize * this.regionSize * 4 - my * this.regionSize * 2;

        const unmapN = (val: number) => {
            if (val % 2 == 1)
                val = (val - 1) * -1;
            return val / 2;
        };
        mz = unmapN(mz);
        my = unmapN(my);
        mx = unmapN(mx);

        const cz = Math.floor(cellId / this.regionSize / this.regionSize);
        const cy = Math.floor((cellId - cz * this.regionSize * this.regionSize) / this.regionSize);
        const cx = cellId - cz * this.regionSize * this.regionSize - cy * this.regionSize;
        return [mx * this.regionSize + cx, my * this.regionSize + cy, mz * this.regionSize + cz];
    }

    // swapForRealBricks(chainBricks: ChainBricks) {
    //     const usageByMaterial = {} as { [material: string]: { ft_balance: number; nft_ids: string[] } };
    //     const positions = [] as any[];
    //     this.forEach((cell, pos) => {
    //         if (!usageByMaterial[cell.material])
    //             usageByMaterial[cell.material] = { ft_balance: 0, nft_ids: [] };
    //         if (cell.id)
    //             usageByMaterial[cell.material].nft_ids.push(cell.id);
    //         else
    //             ++usageByMaterial[cell.material].ft_balance;
    //         positions.push(pos);
    //     });
    //     const swaps = chainBricks.findRealBricks(usageByMaterial);
    //     for (let i = 0; i < swaps.length; ++i) {
    //         const nft = swaps[i];
    //         this._swapBrick(positions[i], nft);
    //         if (!swaps.length)
    //             return;
    //     }
    // }
}
