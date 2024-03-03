import { reactive } from 'vue';
import { builderInputFsm } from './BuilderInputs';
import { CONF } from '@/scripts/builder/conf/conf';

// const { material, color } = palettesMgr.getCurrent().getFirstChoice();

export const inputStore = reactive({
    currentInput: 'place',
    // If true, the regular UI is hidden. Used for some tools such as screenshotting.
    hideInput: false,

    // palettesMgr,
    // selectionMgr: new SelectionManager(),
    // currentColor: color,
    currentColor: '#ff0000',
    // currentMaterial: material || CONF.defaultMaterial,
    currentMaterial: CONF.defaultMaterial,

    defaultSelectionMethod: 'BOX' as 'BOX' | 'VOXEL',
    showMoveGizmo: true,
    showRotateGizmo: false,

    briqOverlayMode: 'KEEP' as 'KEEP' | 'OVERWRITE',

    // If true, a fake element that grabs and stops all events is added to the DOM.
    // Used notably so that selection ignores buttons.
    grabFocus: false,
    switchToState: (state: string, data?: object) => {
        builderInputFsm.switchTo(state, data);
    }
});
