import { inputMap } from './InputMap';
import { InspectInput } from './Inspect';
import { PlacerInput } from './Placer';
import { EraserInput } from './Eraser';

export function setupInputMap() {
    inputMap.place = PlacerInput;
    inputMap.inspect = InspectInput;
    inputMap.erase = EraserInput;
}