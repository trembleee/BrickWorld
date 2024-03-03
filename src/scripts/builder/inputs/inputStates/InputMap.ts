import type { BuilderInputState } from './BuilderInputState';
import type { BuilderInputFSM } from '../BuilderInputs';

/**
 * Map input states to specific FSM states.
 */
export const inputMap: { [key: string]: new (fsm: BuilderInputFSM, canvas: HTMLCanvasElement) => BuilderInputState } = {};