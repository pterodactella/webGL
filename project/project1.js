let gl;
var program;
var currentAngle = 10.0;

const vertices = new Float32Array([ // Vertex coordinates
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
]);

const colors = new Float32Array([ // Colors
    0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, 0.2, 0.58, 0.82, // v0-v1-v2-v3 front
    0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, 0.5, 0.41, 0.69, // v0-v3-v4-v5 right
    0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, 0.0, 0.32, 0.61, // v0-v5-v6-v1 up
    0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, 0.78, 0.69, 0.84, // v1-v6-v7-v2 left
    0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, 0.32, 0.18, 0.56, // v7-v4-v3-v2 down
    0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, 0.73, 0.82, 0.93, // v4-v7-v6-v5 back
]);

const indices = new Uint8Array([
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23 // back
]);

const faces = new Uint8Array([
    1, 1, 1, 1,
    2, 2, 2, 2,
    3, 3, 3, 3,
    4, 4, 4, 4,
    5, 5, 5, 5,
    6, 6, 6, 6

]);

const n = 36;

window.onload = function init() {
    // Initialize the canvas
    var canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl");

    if (!gl) {
        alert("Your browser does not support WebGL");
    }

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Initialize the bffers
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);


    var face_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, face_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, faces, gl.STATIC_DRAW);

    var a_Face = gl.getAttribLocation(program, 'a_Face');
    gl.vertexAttribPointer(a_Face, 1, gl.UNSIGNED_BYTE, false, 0, 0);
    gl.enableVertexAttribArray(a_Face);

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // console.log('n = ', indices.length);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the uniform locations
    var u_matrix = gl.getUniformLocation(program, 'u_matrix');
    var u_PickedFace = gl.getUniformLocation(program, 'u_PickedFace');

    // Get the viewMatrix
    var viewProjectionMatrix = new Matrix4();
    viewProjectionMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
    viewProjectionMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_PickedFace, -1);
    var currentAngle = 0.0;

    canvas.onmousedown = function(ev) { // Mouse is pressed
        var x = ev.clientX,
            y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            // If Clicked position is inside the <canvas>, update the selected surface
            var x_in_canvas = x - rect.left,
                y_in_canvas = rect.bottom - y;
            var face = checkFace(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_PickedFace, viewProjectionMatrix, u_matrix);
            gl.uniform1i(u_PickedFace, face); // Pass the surface number to u_PickedFace
            draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix);
        }
    }

    var tick = function() { // Start drawing
        currentAngle = animate(currentAngle);
        draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix);
        requestAnimationFrame(tick, canvas);
    };
    tick();



}


function checkFace(gl, n, x, y, currentAngle, u_PickedFace, viewProjectionMatrix, u_matrix) {
    var pixels = new Uint8Array(4);
    gl.uniform1i(u_PickedFace, 0);
    draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix);
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels[3];
}


// Model view projection matrix
function draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix) {
    var g_MvpMatrix = new Matrix4();
    // Caliculate The model view projection matrix and pass it to u_matrix
    g_MvpMatrix.set(viewProjectionMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(u_matrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear buffers
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); // Draw
}


var last = Date.now(); // Last time that this function was called
function animate(angle) {
    var now = Date.now(); // Calculate the elapsed time
    var elapsed = now - last;
    last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (currentAngle * elapsed) / 1000.0;
    return newAngle % 360;
}