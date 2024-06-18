import { Shapes } from "./geometry";
import { requestFile } from "./web";

main();

async function main() {
    const device = await init();

    // Test code:
    const mesh = Shapes.circle(0.5);
    //const mesh = Shapes.rectangle();

    const vertexBuffer = device.createBuffer({
        label: 'Vertex buffer',
        size: mesh.VertexSize(),
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    });

    const indexBuffer = device.createBuffer({
        label: 'Index buffer',
        size: mesh.IndexSize(),
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
    });

    device.queue.writeBuffer(vertexBuffer, 0, mesh.Vertices());
    if (mesh.IndexSize()) {
        device.queue.writeBuffer(indexBuffer, 0, mesh.Indices());
    }

    const vertexBufferLayout: GPUVertexBufferLayout = {
        arrayStride: 8,
        attributes: [{
            format: 'float32x2',
            offset: 0,
            shaderLocation: 0
        }]
    };
    
    // TODO: Load shaders as external ressource through HTTP.
    const basicVertexShader = device.createShaderModule({
        label: 'Basic vertex shader',
        code: await requestFile('shaders/basic-vertex.wgsl')
    });

    const basicFragmentShader = device.createShaderModule({
        label: 'Basic fragment shader',
        code: await requestFile('shaders/basic-fragment.wgsl')
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
    
    const renderPass = encoder.beginRenderPass({
        colorAttachments: [{
           view: context.getCurrentTexture().createView(),
           loadOp: "clear",
           clearValue: { r: 0, g: 0, b: 0.4, a: 1 }, // New line
           storeOp: "store",
        }]
    });

    renderPass.setPipeline(renderPipeline);
    renderPass.setVertexBuffer(0, vertexBuffer);
    if (mesh.IndexSize()) {
        // TODO: Support both formats through abstraction.
        // TODO: Fix byte multiple for uint16.
        renderPass.setIndexBuffer(indexBuffer, 'uint32');
        renderPass.drawIndexed(mesh.IndexCount());
    }
    else {
        renderPass.draw(mesh.VertexCount());
    }

    renderPass.end();

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