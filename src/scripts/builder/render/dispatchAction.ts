import { Brick, SerializedBrick } from '../brick/brick';
import { BrickSet, SerializedBrickSet } from '../brick/brickSet';

export const dispatchedActions: Array<{ action: string; payload: any }> = [];

export type type_select_set_payload = { setId: string, bricks: Array<{ pos: [number, number, number], color: string, material: string, id: string | undefined }> };
export type type_place_brick_payload = { setId: string; brick: SerializedBrick; pos: [number, number, number] };
export type type_remove_brick_payload = { setId: string; brick: { id: string | undefined }; pos: [number, number, number] };

const preprocessor: { [key: string]: (payload: any) => any } = {
    select_set: (payload: BrickSet): type_select_set_payload => {
        // Fetch the minimum required data to place stuff.
        const data: type_select_set_payload = { setId: payload.id, bricks: [] };

        payload.forEach((cell: Brick, pos: [number, number, number]) => {
            data.bricks.push({ pos, color: cell.color, material: cell.material, id: cell.id });
        });
        return data;
    },
    // place_bricks: (payload: { pos: [number, number, number]; color?: string; material?: string }[]) => {
    //     return payload;
    // },
    // New versions
    place_brick: (payload: type_place_brick_payload) => {
        return payload;
    },
    remove_brick: (payload: type_remove_brick_payload) => {
        return payload;
    },
};

export function dispatchBuilderAction(action: string, payload?: any) {
    dispatchedActions.push({ action, payload: preprocessor?.[action]?.(payload) ?? payload });
}