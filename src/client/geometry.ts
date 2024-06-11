export class Mesh {
    private vertices: Float32Array;

    constructor(vertices: Float32Array) {
        this.vertices = vertices;
    }
    
    Vertices(): Float32Array {
        return this.vertices;
    }

    Size(): number {
        return this.vertices.byteLength;
    }

    Count(): number {
        return this.vertices.length / 2; // TODO: Valid for 2D vertices
    }
}

export const Shapes = {
    triangle: function() {
        throw Error('Not implemented');
    },
    rectangle: function(width: number=0.5, height: number=0.5) {
        // TODO: Use index buffer.
        return new Mesh(new Float32Array([
            // Bottom triangle
            -width, -height,
            width, -height,
            width, height,
            // Top triangle
            -width, -height,
            width, height,
            -width, height
        ]));
    },
    circle: function() {
        throw Error('Not implemented');
    }
};