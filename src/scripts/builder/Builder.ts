import {
    threeSetupComplete,
    THREE,
    OrbitControls,
    EffectComposer,
    RenderPass,
    // SSAARenderPass,
    // TAARenderPass,
    // SSAOPass,
    SMAAPass,
    ShaderPass,
    GammaCorrectionShader,
    FXAAShader,
} from '@/scripts/builder/render/three';


import { CONF } from './conf/conf';

import { bounds, getSetObject, handleActions, GroundGrid } from './render/runtime_rendering';
import { BrickGrid } from './brick/brickGrid';
import { HemisphereLight, Scene } from 'three';
import { watchEffect } from 'vue';
import { dispatchBuilderAction, dispatchedActions } from './render/dispatchAction';
import { logDebug } from '../utils/Message';
import { Brick } from './brick/brick';

// The camera of the scene
export let camera: THREE.Camera;

// OrbitControls, exported so we can pass them to inputs.
export const orbitControls = {
    controls: undefined as unknown as InstanceType<typeof OrbitControls>,
};

export let scene: THREE.Scene;

let renderer: THREE.Renderer;

let composer: InstanceType<typeof EffectComposer>;

let grid: BrickGrid;

function getCanvasSize() {
    if (!bounds?.min) return 5;
    return Math.max(5, ...[0, 1, 2].map(i => bounds.max![i] - bounds.min![i]));
}

function resetCamera() {
    camera.position.set(...(([-0.3, 0.8, 1.4].map(x => x * getCanvasSize())) as [number, number, number]));
    // any type
    orbitControls.controls.target.set(0, 1, 0);
    orbitControls.controls.update();
}

function addDefaultLights(scene: THREE.Scene, x: number, y: number, z: number) {
    // directional light
    const lightSpot = new THREE.DirectionalLight(new THREE.Color(0x888888).convertSRGBToLinear(), 2.0);
    lightSpot.position.set(x, y, z);
    lightSpot.castShadow = true;
    lightSpot.shadow.bias = getCanvasSize() ? -0.01 : -0.001;
    lightSpot.shadow.normalBias = 0.05;
    lightSpot.shadow.camera.near = 0.1;
    lightSpot.shadow.camera.far = getCanvasSize() * 3;
    lightSpot.shadow.camera.left = -getCanvasSize() * 1.3;
    lightSpot.shadow.camera.right = getCanvasSize() * 1.3;
    lightSpot.shadow.camera.bottom = -getCanvasSize();
    lightSpot.shadow.camera.top = getCanvasSize() * 3;
    lightSpot.shadow.mapSize.width = getCanvasSize() > 30 ? 2048 : 1024;
    lightSpot.shadow.mapSize.height = getCanvasSize() > 30 ? 2048 : 1024;
    scene.add(lightSpot);

    // ambient light
    const ambientLight = new THREE.AmbientLight(new THREE.Color(0x888888).convertSRGBToLinear(), 2.0);
    scene.add(ambientLight);
}

function setupScene() {
    if (!scene) scene = new THREE.Scene();
    scene.clear();

    addDefaultLights(scene, 1 * getCanvasSize() / 2, 2 * getCanvasSize() / 2, 3 * getCanvasSize() / 2);

    scene.background = new THREE.Color("#FAFAFA");
    // scene.background = null;

    // if (!GroundGrid.grid) {
    //     GroundGrid.generate();
    //     const grid = GroundGrid.grid as THREE.Mesh;
    //     scene.add(grid);
    //     logDebug("Grid added to the scene.");
    // }


    if (!GroundGrid.grid) {
        GroundGrid.generate();
    }

    // the adding must be setup outside the if block since every time the scene is updated, the scene would be cleared.
    scene.add(GroundGrid.grid);
    logDebug("Grid added to the scene.");

    const brickObjects = getSetObject();
    scene.add(brickObjects);

    return scene;
}

function createRenderer(canvas: HTMLCanvasElement, scene: THREE.Scene, camera: THREE.Camera) {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true }); // passing canvas as prop, act the same as render.setSize()
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = builderSettings.aaLevel !== '0' ? THREE.VSMShadowMap : THREE.BasicShadowMap; //THREE.VSMShadowMap; //THREE.PCFShadowMap;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    //renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setClearColor(0x000000, 0);

    const parameters = {
        minFilter: THREE.LinearFilter, // used when a pixel's texture is mapped to a area bigger than a texel
        magFilter: THREE.LinearFilter, // used when a pixel's texture is mapped to a area smaller than a texel
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
    };

    const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);
    const composer = new EffectComposer(renderer, renderTarget);

    // anti-aliasing SSAA, related to scene and camera
    // const renderPass = new 
    // TODO:
    const useSSAA = false;
    if (useSSAA) {
        logDebug("This is reserved for SSAA");
    } else {
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);
    }

    // ssao
    // TODO:

    /* ThreeJS auto-renders the final pass to the screen directly, which breaks my scene layering. */
    /* Instead, add a manual 'write to screen' pass. Use it for sRGB correction while at it. */
    {
        const copyPass = new ShaderPass(GammaCorrectionShader);
        composer.addPass(copyPass);
    }

    // other aa pass
    {
        const size = new THREE.Vector2();
        renderer.getSize(size);
        const copyPass = new SMAAPass(size.x, size.y);
        composer.addPass(copyPass);
    }

    return { renderer, composer };

}

function resizeRendererToDisplaySize(renderer: THREE.Renderer, composer: InstanceType<typeof EffectComposer>, camaera: THREE.Camera) {
    const canvas = renderer.domElement;
    // const width = canvas.clientWidth; // the width to display
    // const height = canvas.clientHeight;
    const width = window.innerWidth // the width to display
    const height = window.innerHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        logDebug("Before resize: " + width + " " + height);
        renderer.setSize(width, height, false); // set to false to prevent any change to the style of canvas
        composer.setSize(width, height);

        // if the passes in composer can change size
        for (const pass of composer.passes) {
            pass.setSize(width, height);
        }

        const canvas = renderer.domElement;
        if (camera instanceof THREE.PerspectiveCamera) {
            // camera.aspect = canvas.clientWidth / canvas.clientHeight; // why this?
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        logDebug("After resize: " + width + " " + height);
    }
    return needResize;
}

export function render() {

    resizeRendererToDisplaySize(renderer, composer, camera);

    orbitControls.controls.update();

    // update the scene
    handleActions(dispatchedActions);

    // the real render function
    composer.render();
}

let _sceneSetup: CallableFunction;
// somewhere else will wait sceneSetup to be resolve(to be finished)
export const sceneSetup = new Promise(resolve => {
    _sceneSetup = resolve;
});

export async function setupCanvas(canvas: HTMLCanvasElement) {
    // wait threejs to load
    await threeSetupComplete;

    const fov = 45;
    const aspect = 2;
    const near = 0.02;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    orbitControls.controls = new OrbitControls(camera, canvas);
    // to give the camera movement an inertial
    orbitControls.controls.enableDamping = true;
    // Bump the damping a bit from the default of 0.05 to make camera movements more precise.
    orbitControls.controls.dampingFactor = 0.1;
    resetCamera();

    setupScene();

    // create renderer and composer
    watchEffect(() => {
        if (renderer) {
            if (renderer instanceof THREE.WebGLRenderer) {
                // if renderer already exists, dispose it and make a new one
                renderer.dispose();
            }
        }
        ({ renderer, composer } = createRenderer(canvas, scene, camera));
    })

    // recreate scene when scene changed
    watchEffect(() => {
        scene = setupScene();
    })

    _sceneSetup();
}

export async function unmount() {
    scene.clear();
    if (renderer instanceof THREE.WebGLRenderer) {
        renderer?.dispose();
    }
}