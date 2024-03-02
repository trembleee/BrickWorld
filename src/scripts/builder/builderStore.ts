import { builderInputFsm } from './inputs/BuilderInputs';
import { shallowRef } from "vue";
import { BrickSet } from "./brick/brickSet";
import { logDebug } from "@/scripts/utils/Message";


export const builderStore = (() => {
    const _currentSet = shallowRef(undefined as unknown as BrickSet);
    const currentSet = shallowRef(_currentSet);

    const selectSet = async (set: BrickSet) => {
        logDebug('BUILDER SWICTHING TO SET ', set.id);
        // set input state to inspect when selecting set
        builderInputFsm.switchTo('inspect')
        _currentSet.value = set;
    }

    const resetBuilderState = () => {
        logDebug('BUILDER - RESETTING STATE');
        _currentSet.value = undefined as unknown as BrickSet;
    }

    return {
        currentSet,
        selectSet,
        resetBuilderState
    };
})();