import { Brick } from '../brick/brick';
import { BrickSet } from '../brick/brickSet';

export const dispatchedActions: Array<{ action: string; payload: any }> = [];

export type type_select_set_payload = { setId: string, bricks: Array<{ pos: [number, number, number], color: string, material: string, id: string | undefined }> };

const preprocessor: { [key: string]: (payload: any) => any } = {
    select_set: (payload: BrickSet) => {
        // Fetch the minimum required data to place stuff.
        const data = { setId: payload.id, bricks: [] as Array<{ pos: [number, number, number], color: string, material: string, id: string | undefined }> };

        payload.forEach((cell: Brick, pos: [number, number, number]) => {
            data.bricks.push({ pos, color: cell.color, material: cell.material, id: cell.id });
        });
        return data;
    },
    place_bricks: (payload: { pos: [number, number, number]; color?: string; material?: string }[]) => {
        return payload;
    },
    // New versions
    place_brick: (payload: { setId: number; brickData: any }) => {
        return payload;
    },
    remove_brick: (payload: { setId: number; position: [number, number, number] }) => {
        return payload;
    },
};

export function dispatchAction(action: string, payload?: any) {
    dispatchedActions.push({ action, payload: preprocessor?.[action]?.(payload) ?? payload });
}