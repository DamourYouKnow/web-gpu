export class Mesh {
    private vertices: Float32Array;
    private indices?: Uint32Array;

    constructor(vertices: Float32Array, indices?: Uint32Array) {
        this.vertices = vertices;
        this.indices = indices;
    }
    
    Vertices(): Float32Array {
        return this.vertices;
    }

    Indices(): Uint32Array | null {
        if (!this.indices) return null;
        return this.indices;
    }

    VertexSize(): number {
        return this.vertices.byteLength;
    }

    IndexSize(): number {
        if (!this.indices) return 0;
        return this.indices.byteLength;
    }

    VertexCount(): number {
        return this.vertices.length / 2; // TODO: Valid for 2D vertices
    }

    IndexCount(): number {
        if (!this.indices) return 0;
        return this.indices.length;
    }
}

export const Shapes = {
    triangle: function() {
        throw Error('Not implemented');
    },
    rectangle: function(width: number=0.5, height: number=0.5) {
        const vertices = new Float32Array([
            -width, -height,
            width, -height,
            width, height,
            -width, height
        ]);

        const indices = new Uint32Array([
            0, 2, 3,
            0, 1, 2
        ]);

        // TODO: Use index buffer.
        return new Mesh(vertices, indices);
    },
    circle: function(radius: number=0.5, vertices: number=64) {
        // TODO: Assert vertices >= 3

        const verticeArray = new Float32Array((vertices + 1) * 2);
        const indexArray = new Uint32Array(vertices * 3);
        const angleStep = (2.0 * Math.PI) / vertices;
        let currentAngle = 0.0;
        let index = 0;
        
        verticeArray[0] = 0.0;
        verticeArray[1] = 0.0;
        for (let vertex = 1; vertex < vertices + 1; vertex++) {
            verticeArray[vertex * 2] = radius * Math.cos(currentAngle);
            verticeArray[(vertex * 2) + 1] = radius * Math.sin(currentAngle);
            
            indexArray[index++] = 0;
            indexArray[index++] = vertex;
            indexArray[index++] = vertex != vertices ? vertex + 1 : 1;

            currentAngle += angleStep;
        }

        return new Mesh(verticeArray, indexArray);
    }
};