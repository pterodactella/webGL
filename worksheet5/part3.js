var gl;
var modelView;
var projection;
var modelViewLoc;
var projectionLoc;
var program;
var lightPosition = [1.0, 1.0, 1.0, 0.0];
var ambient = [0.1, 1.5, 2.5, 1.0];
var diffuse = [1.0, 1.0, 1.0, 1.0];
var specular = [0.7, 0.7, 0.7, 0.7];

var shininess = 10;
var back_ambient = [0.5, 0.3, 0.1, 1.0];
var back_diffuse = [1.0, 0.5, 0.1, 1.0];
var back_specular = [1.0, 1.0, 1.0, 1.0];
var theta = 0.0;
var phi = 1.0;
var model;



window.onload = function init() {
    var canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("Your browser does not support web gl"); return; }


    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);


    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    program.vPosition = gl.getAttribLocation(program, 'vertex_Position');
    program.vNormal = gl.getAttribLocation(program, 'Normal');
    program.vColor = gl.getAttribLocation(program, 'fColor');


    model = initVertexBuffers(gl, program);
    // Read the file content for Suzanne :D
    readOBJFile("untitled.obj", gl, model, 0.6, true);

    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");
    lightLoc = gl.getUniformLocation(program, "LightPosition");



    draw();

}


// Create the buffer object and perform the initial configuration

function initVertexBuffers(gl, program) {
    var o = new Object();
    o.vertexBuffer = createEmptyArrayBuffer(gl, program.vPosition, 3, gl.FLOAT);
    o.normalBuffer = createEmptyArrayBuffer(gl, program.vNormal, 3, gl.FLOAT);
    o.colorBuffer = createEmptyArrayBuffer(gl, program.vColor, 4, gl.FLOAT);
    o.indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return o;
}

// Create a buffer object, assign it to attribute variables
function createEmptyArrayBuffer(gl, a_attribute, num, type) {
    //Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        // Throw error message in case the buffer could not be created
        console.log('Failed to create the buffer object');
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);
    return buffer;
}

// Read a file
function readOBJFile(fileName, gl, model, scale, reverse) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status !== 404) {
            onReadOBJFile(request.responseText, fileName, gl, model, scale, reverse);
        }
    }
    request.open("GET", fileName, true); // Create a request to get file
    request.send(); // Send the request

}

var g_objDoc = null; // Information of the obj file
var g_drawingInfo = null; // Information for drawing the 3D model


function onReadOBJFile(fileString, fileName, gl, o, scale, reverse) {

    var objDoc = new OBJDoc(fileName);
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null;
        g_drawingInfo = null;
        console.log("OBJ file parsing error");
        return;
    }
    g_objDoc = objDoc;

}
// OBJ File has been read completely
function onReadComplete(gl, objDoc) {
    // Acquire the vertex coordinates and colors from OBJ file
    var drawingInfo = objDoc.getDrawingInfo();

    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    // Write the indices to the buffer object
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}



function draw() {
    ambient_Product = mult(ambient, back_ambient);
    diffuse_Product = mult(diffuse, back_diffuse);
    specular_Product = mult(specular, back_specular);

    gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"), flatten(ambient_Product));
    gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"), flatten(diffuse_Product));
    gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"), flatten(specular_Product));
    gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "Shininess"), shininess);

    render();
    requestAnimationFrame(draw);

}


function render() {
    if (g_objDoc !== null && g_objDoc.isMTLComplete()) {
        g_drawingInfo = onReadComplete(gl, g_objDoc);
        g_objDoc = null;
    }
    if (!g_drawingInfo) {
        return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    phi += 0.4;
    var radius = 2.0
    eye = vec3(radius * Math.sin(phi), radius * Math.sin(theta), radius * Math.cos(phi));

    modelViewMat = lookAt(vec3(2.0 * Math.sin(theta * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(theta * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0));
    projectionMat = ortho(-1, 1.0, -1.0, 1.0, 1, 100);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMat));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMat));
    gl.uniform4fv(lightLoc, flatten(lightPosition));

    gl.drawElements(gl.TRIANGLES, g_drawingInfo.indices.length, gl.UNSIGNED_SHORT, 0);
}