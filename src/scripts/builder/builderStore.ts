import { builderInputFsm } from './inputs/BuilderInputs';
import { shallowRef } from "vue";
import { BrickSet, SerializedBrickSet } from "./brick/brickSet";
import { logDebug } from "@/scripts/utils/Message";
import { inputStore } from '@/scripts/builder/inputs/InputStore'

const { switchToState } = inputStore;


export const builderStore = (() => {
    const _currentSet = shallowRef(undefined as unknown as BrickSet);
    const currentSet = shallowRef(_currentSet);

    const _stateHistory: Array<SerializedBrickSet> = [];
    let currentStateIndex = -1;

    const selectSet = async (set: BrickSet) => {
        logDebug('BUILDER SWICTHING TO SET ', set.id);
        // set input state to inspect when selecting set
        // builderInputFsm.switchTo('inspect')
        switchToState('inspect');
        _currentSet.value = set;
    }

    const resetBuilderState = () => {
        logDebug('BUILDER - RESETTING STATE');
        _stateHistory.splice(0, _stateHistory.length); // clear history
        _currentSet.value = undefined as unknown as BrickSet;
    }

    const saveState = (serializedSet: SerializedBrickSet): void => {
        currentStateIndex++;
        _stateHistory.splice(currentStateIndex);
        _stateHistory.push(serializedSet);
    }

    const getCurrenState = (): SerializedBrickSet => {
        return _stateHistory[currentStateIndex];
    }

    const undoState = (): SerializedBrickSet => {
        if (currentStateIndex > 0) {
            currentStateIndex--;
            return _stateHistory[currentStateIndex];
        }
        return getCurrenState();
    }

    const redoState = (): SerializedBrickSet => {
        if (currentStateIndex < _stateHistory.length - 1) {
            currentStateIndex++;
            return _stateHistory[currentStateIndex];
        }
        return getCurrenState();
    }

    const debugState = () => {
        console.log(_stateHistory);
        console.log(currentStateIndex);
    }


    return {
        currentSet,
        selectSet,
        resetBuilderState,
        saveState,
        undoState,
        redoState,
        getCurrenState,
        debugState
    };
})();