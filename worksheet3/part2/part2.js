var gl;
var points = [];
var cubeVertices;
var view;
var modelView;
var projection;
var modelViewLoc;
var projectionLoc;
var perspectiveMatrix;

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

    var fieldOfView = 45;
    var aspect = gl.canvas.width / gl.canvas.height;
    var near = 1;
    var far = 2000;


    // Set up perspective and view
    pMatrix = perspective(fieldOfView, aspect, near, far);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(pMatrix));



    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // One point Perspective
    var perspective1 = mult(
        lookAt(vec3(2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(0.0 * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)),
        scalem(0.25, 0.25, 0.65)
    );
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(perspective1));
    gl.drawArrays(gl.LINES, 0, points.length);

    // Two point Perspective
    var perspective2 = mult(mult(mult(mult(mult(
                        lookAt(vec3(2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(0.0 * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)),
                        scalem(0.25, 0.25, 0.65)),
                    translate(-1.90, 0.0, 0.0)),
                rotateX(0.0)),
            rotateY(-5.0)),
        rotateZ(0.0)

    );

    // var perspective2Mat = perspective(100 * Math.PI / 180.0, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(perspective2));
    // gl.uniformMatrix4fv(modelViewLoc, false, flatten(perspective2Mat));
    gl.drawArrays(gl.LINES, 0, points.length);


    // Three point perspective

    var perspective3 = mult(mult(mult(mult(mult(
                        lookAt(vec3(2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(0.0 * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)),
                        scalem(0.25, 0.25, 0.25)),
                    translate(1.90, 0.0, 0.0)),
                rotateX(-10.0)),
            rotateY(0.0)),
        rotateZ(10.0)

    );

    // var perspective2Mat = perspective(100 * Math.PI / 180.0, gl.canvas.clientWidth / gl.canvas.clientHeight, 1, 2000);
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(perspective3));
    // gl.uniformMatrix4fv(modelViewLoc, false, flatten(perspective2Mat));
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