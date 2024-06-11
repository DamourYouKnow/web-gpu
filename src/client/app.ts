import { Shapes } from "./geometry";

main();

async function main() {
    const device = await init();

    // Test code:
    const rectangleMesh = Shapes.rectangle();

    const vertexBuffer = device.createBuffer({
        label: 'Triangle',
        size: rectangleMesh.Size(),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(vertexBuffer, 0, rectangleMesh.Vertices());

    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8,
        attributes: [{
            format: 'float32x2',
            offset: 0,
            shaderLocation: 0
        }]
    };
    
    const basicVertexShader = device.createShaderModule({
        label: 'Basic vertex shader',
        code: `
            @vertex
            fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
                return vec4f(pos, 0, 1);
            }
        `
    });

    const basicFragmentShader = device.createShaderModule({
        label: 'Basic fragment shader',
        code: `
            @fragment
            fn fragmentMain() -> @location(0) vec4f {
                return vec4f(1, 0, 0, 1); // (Red, Green, Blue, Alpha)
            }
        `
    });

    // TODO: Share with init
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const canvas = document.getElementById('app-canvas') as HTMLCanvasElement;
    const context = canvas.getContext('webgpu');

    const renderPipeline = device.createRenderPipeline({
        label: 'Render pipeline',
        layout: 'auto',
        vertex: {
            module: basicVertexShader,
            entryPoint: 'vertexMain',
            buffers: [vertexBufferLayout]
        },
        fragment: {
            module: basicFragmentShader,
            entryPoint: 'fragmentMain',
            targets: [{
                format: canvasFormat
            }]
        },
    });

    const encoder = device.createCommandEncoder();
    
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
           view: context.getCurrentTexture().createView(),
           loadOp: "clear",
           clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
           storeOp: "store",
        }]
    });

    pass.setPipeline(renderPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(rectangleMesh.Count());

    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);  
    device.queue.submit([encoder.finish()]);

}

async function init(): Promise<GPUDevice> {
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

    return device;
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