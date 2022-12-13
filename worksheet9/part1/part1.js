var image = document.createElement('img');
var animateTeapotButton = document.getElementById("teapotAnimation");
var addExtraViewButton = document.getElementById("extraView");
var animateLightButton = document.getElementById("lightAnimation");
var gl;
var programTeapot;
var programGround;
var groundModelViewLoc;
var groundProjectionLoc;
var teapotModelViewLoc;
var teapotLoc;
var teapotProjectionLoc;
var teapotAnimationBool = true;
var extraViewBool = false;
var lightAnimationBool = false;
var teapotModel = {};
var groundModel = {};
var g_objDoc;
var drawing_Info;

// Ground vertices
var verticess = [
    [-2, -1, -1],
    [-2, -1, -5],
    [2, -1, -5],
    [2, -1, -1]
];
// Texture coordinates
var texCoords = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1]
];


window.onload = function init() {

    var canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) { alert("Your browser does not support web gl"); return; }

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.cullFace(gl.BACK);


    // Initialize the Teapot program
    programTeapot = initShaders(gl, "vertex-shader-teapot", "fragment-shader-teapot");
    gl.useProgram(programTeapot);


    let teapotPosition = gl.getAttribLocation(programTeapot, "vertex_position");
    gl.vertexAttribPointer(teapotPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(teapotPosition);


    let teapotColor = gl.getAttribLocation(programTeapot, 'vertex_color');
    gl.vertexAttribPointer(teapotColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(teapotColor);

    programTeapot.color = teapotColor;
    teapotModel.vertexBuffer = createEmptyArrayBuffer(gl, programTeapot.position, 3, gl.FLOAT);
    teapotModel.colorBuffer = createEmptyArrayBuffer(gl, programTeapot.color, 4, gl.FLOAT);
    teapotModel.indexBuffer = gl.createBuffer();

    readOBJFile('/worksheet9/part1/teapot/teapot.obj', 0.25, false);

    // Init the Ground shaders
    programGround = initShaders(gl, "vertex-shader-ground", "fragment-shader-ground");
    gl.useProgram(programGround);


    let groundPosition = gl.getAttribLocation(programGround, "vertex_position");
    gl.vertexAttribPointer(groundPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(groundPosition);


    programGround.texPosition = gl.getAttribLocation(programGround, 'texPosition');
    gl.getUniformLocation(programGround, 'texMap');

    groundModel.vertexBuffer = createEmptyArrayBuffer(gl, programGround.position, 3, gl.FLOAT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticess), gl.STATIC_DRAW);


    groundModel.texCoordsBuffer = createEmptyArrayBuffer(gl, programGround.texPosition, 2, gl.FLOAT);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    groundModel.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundModel.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array([0, 3, 2, 0, 2, 1]), gl.STATIC_DRAW);


    // Init shader locations
    groundProjectionLoc = gl.getUniformLocation(programGround, 'perspective');
    groundModelViewLoc = gl.getUniformLocation(programGround, 'modelView');

    teapotModelViewLoc = gl.getUniformLocation(programTeapot, 'modelView');
    teapotLoc = gl.getUniformLocation(programTeapot, 'visible');
    teapotProjectionLoc = gl.getUniformLocation(programTeapot, 'projection');

    // Create texture
    var text = gl.createTexture();
    image.onload = function() {

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, text);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    };
    image.src = '/worksheet8/xamp23.png';



    animateTeapotButton.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            console.log('teapot animation checked');
            teapotAnimationBool = true;;
        } else {
            console.log('teapot animation unchecked');
            teapotAnimationBool = false;
        }
    })


    addExtraViewButton.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            console.log('extraview checked');
            extraViewBool = true;;
        } else {
            console.log('extraView unchecked');
            extraViewBool = false;
        }
    })

    animateLightButton.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            console.log('light animation checked');
            lightAnimationBool = true;;
        } else {
            console.log('light animation unchecked');
            lightAnimationBool = false;
        }
    })
    render();
}

function render() {

    var l = vec3(0.0, 0.25, -1.0);
    var time = Date.now() / 1000;

    // Projection shadow matrix
    var projectionMatrix = mat4();
    projectionMatrix[3][3] = 0;
    projectionMatrix[3][1] = -1 / (l[1] + 1);
    l[0] = lightAnimationBool ? Math.sin(time) : -0.1;
    l[2] = lightAnimationBool ? -2 + Math.cos(time) : -2;



    gl.useProgram(programGround);

    // The ground Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, groundModel.vertexBuffer);
    gl.vertexAttribPointer(programGround.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programGround.position);

    gl.bindBuffer(gl.ARRAY_BUFFER, groundModel.texCoordsBuffer);
    gl.vertexAttribPointer(programGround.texPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programGround.texPosition);


    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, groundModel.indexBuffer);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);


    var projection = mult(
        perspective(90, 1, 1, 30),
        lookAt(extraViewBool ? vec3(0, 2, -2) : vec3(0, 0, 0), vec3(0, 0, -3), vec3(0, 1, 0)),
    );

    gl.uniformMatrix4fv(groundProjectionLoc, false, flatten(projection));
    gl.uniformMatrix4fv(groundModelViewLoc, false, flatten(mat4()));


    gl.useProgram(programTeapot);

    // The teapot Buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, teapotModel.vertexBuffer);
    gl.vertexAttribPointer(programTeapot.position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programTeapot.position);


    gl.bindBuffer(gl.ARRAY_BUFFER, teapotModel.colorBuffer);
    gl.vertexAttribPointer(programTeapot.color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programTeapot.color);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapotModel.indexBuffer);


    if (!drawing_Info && g_objDoc) {
        drawing_Info = onReadComplete(gl, teapotModel, g_objDoc);
    }
    if (drawing_Info) {

        var coordinateY = teapotAnimationBool ? 0.25 * Math.cos(time) : -1;
        var modelViewMatrix = mult(
            translate(0, coordinateY, -3),
            scalem(0.75, 0.75, 0.75),
        );


        var modelView = mult(mult(mult(mult(
                        translate(0, -1, 0),
                        translate(l[0], l[1], l[2])),
                    projectionMatrix),
                translate(-l[0], -[1], -l[2])),
            modelViewMatrix
        );
        gl.uniformMatrix4fv(teapotModelViewLoc, false, flatten(modelView));

        gl.uniform1f(teapotLoc, false);
        gl.depthFunc(gl.GREATER);
        gl.drawElements(gl.TRIANGLES, 18960, gl.UNSIGNED_SHORT, 0);
        gl.uniformMatrix4fv(teapotModelViewLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(teapotProjectionLoc, false, flatten(projection));

        gl.depthFunc(gl.LESS);
        gl.uniform1f(teapotLoc, true);

        gl.drawElements(gl.TRIANGLES, 18960, gl.UNSIGNED_SHORT, 0);
    };

    requestAnimationFrame(render);
}









// Helper functions from Lecture 6 :D 
// -----------------------------------------------------------------------------------------------------------------------------------
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




// Since we have two programs for each of the objects, we will have two models thus we need to modify the functions and pass the model as parameter as well
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



// Since we have two programs for each of the objects, we will have two models thus we need to modify the functions and pass the model as parameter as well
function onReadOBJFile(fileString, fileName, scale, reverse) {

    var objDoc = new OBJDoc(fileName);
    var result = objDoc.parse(fileString, scale, reverse);
    if (!result) {
        g_objDoc = null;
        drawing_Info = null;
        console.log("OBJ file parsing error");
        return;
    }
    g_objDoc = objDoc;

}


// Since we have two programs for each of the objects, we will have two models thus we need to modify the functions and pass the model as parameter as well
function onReadComplete(gl, model, objDoc) {
    var drawingInfo = objDoc.getDrawingInfo();

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, model.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);

    return drawingInfo;
}