var gl;
var points = [];
var cubeVertices;
var view;
var modelView;
var projection;
var modelViewLoc;
var projectionLoc;

window.onload = function init() {
    var canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("Your browser does not support web gl"); return; }


    cubeVertices = [
        vec4(-0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.5, 1.0),
        vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0),
        vec4(-0.5, 0.5, -0.5, 1.0),
        vec4(0.5, 0.5, -0.5, 1.0),
        vec4(0.5, -0.5, -0.5, 1.0)
    ];


    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.enable(gl.DEPTH_TEST);


    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    drawCube();


    // Vertex buffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vertex_Position = gl.getAttribLocation(program, 'vertex_Position');
    gl.vertexAttribPointer(vertex_Position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(points);


    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Orthographic view 
    view = vec3(Math.sin(45.0 / 180.0 * Math.PI), Math.sin(45.0 / 180.0 * Math.PI),
        Math.cos(45.0 / 180.0 * Math.PI));

    modelViewMatrix = lookAt(view, [0.0, 0.0, 0.0], [0.0, 1.0, 0.0]);
    projectionMatrix = ortho(-1.0, 1.0, -1.0, 1.0, -1, 10);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));
    gl.drawArrays(gl.LINES, 0, points.length);

}

function drawCube() {
    quad(1, 0, 2, 3);
    quad(4, 5, 7, 6);
    quad(0, 4, 3, 7);
    quad(5, 1, 6, 2);
    quad(5, 4, 1, 0);
    quad(7, 6, 3, 2);
}

function quad(a, b, c, d) {
    var indices = [a, b, c, a, c, d];
    for (var i = 0; i < indices.length; ++i) {
        points.push(cubeVertices[indices[i]]);
    }
}