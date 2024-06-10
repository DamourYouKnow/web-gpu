main();

function main() {
    init();
}

async function init() {
    if (!browserSupportsWebGPU()) {
        throw Error('WebGPU not supported');
    } 

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw Error('Could not create GPU adapter');
    }

    const device = await adapter.requestDevice();
    if (!device) {
        throw Error('Could not create device');
    } 

    const canvas = createCanvas();
    const context = canvas.getContext('webgpu');
    
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: canvasFormat
    });
}

function createCanvas(): HTMLCanvasElement {
    const container = document.getElementById('canvas-container');
    if (!container) throw Error('No element with id "canvas-container"');

    const canvas = document.createElement('canvas');
    canvas.id = 'app-canvas';
    canvas.width = 1280;
    canvas.height = 720;

    container.appendChild(canvas);
    return canvas;
}

function browserSupportsWebGPU(): boolean {
    return navigator.gpu != undefined;
}