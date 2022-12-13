var canvas = document.getElementById("webgl");
var groundImage = document.createElement('img');
groundImage.src = '/worksheet8/xamp23.png';


var vertices = [
    [-2, -1, -1, 1],
    [2, -1, -1, 1],
    [2, -1, -5, 1],
    [-2, -1, -1, 1],
    [2, -1, -5, 1],
    [-2, -1, -5, 1],
    //quad1
    [0.25, -0.5, -1.25, 1],
    [0.75, -0.5, -1.25, 1],
    [0.75, -0.5, -1.75, 1],
    [0.25, -0.5, -1.25, 1],
    [0.75, -0.5, -1.75, 1],
    [0.25, -0.5, -1.75, 1],
    // quad2
    [-1, 0, -2.5, 1],
    [-1, -1, -2.5, 1],
    [-1, -1, -3, 1],
    [-1, 0, -2.5, 1],
    [-1, 0, -3, 1],
    [-1, -1, -3, 1]
]

var textureCoords = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 0],
    [1, 1],
    [0, 1],
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
]


// We need to define the light source and the shadow matrix 
// var l = [0.0, 2.0, -2.0];
// var shadowMatp = [
//     1, 0, 0, 0,
//     0, 1, 0, 0,
//     0, 0, 1, 0,
//     0, 0, 0, 1
// ]

// shadowMatp[3][3] = 0;
// shadowMatp[3][1] = -1 / l[1];


window.onload = function init() {
    var canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);
    gl = canvas.getContext("webgl", { alpha: false });
    if (!gl) {
        alert("Your browser does not support WebGL");
    }

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // let colorBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    // let vertecColor = gl.getAttribLocation(program, "aColor");
    // gl.vertexAttribPointer(vertecColor, 4, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(vertecColor);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    let aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureCoords), gl.STATIC_DRAW);

    let aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    let texMap = gl.getUniformLocation(program, 'texMap');

    gl.activeTexture(gl.TEXTURE0);
    let groundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, groundImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.activeTexture(gl.TEXTURE1);
    let red = gl.createTexture();
    let redImg = new Uint8Array([255, 0, 0]);
    gl.bindTexture(gl.TEXTURE_2D, red);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, redImg);



    gl.activeTexture(gl.TEXTURE2);
    let black = gl.createTexture();
    let blackImg = new Uint8Array([0, 0, 0]);
    gl.bindTexture(gl.TEXTURE_2D, black);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, blackImg);

    let modelView = gl.getUniformLocation(program, 'modelView');
    let projection = gl.getUniformLocation(program, 'projection');

    let theta = 0.1;
    // let rotationMat = rotateY(10);
    var l = vec3(0.0, 2.0, -2.0);
    var shadowMatp = mat4();
    shadowMatp[3][3] = 0;
    shadowMatp[3][1] = -1 / l[1];
    l[0] = Math.sin(theta) - 0.1;
    l[2] = Math.cos(theta) - 2;


    let modelViewMatrix = lookAt([0, -1, -11], [0, -1, -11], [0, 1, 0]);
    let projectionMatrix = perspective(90, 1, 0.1, 21);


    gl = WebGLUtils.setupWebGL(canvas, { alpha: false });

    gl.uniformMatrix4fv(modelView, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projection, false, flatten(projectionMatrix));

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1i(texMap, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.uniform1i(texMap, 1);
    gl.drawArrays(gl.TRIANGLES, 6, 12);

    // draw the shadows 
    shadowMat = mult(modelViewMatrix, translate(l[0], l[1] - 0.99, l[2]));
    shadowMat = mult(shadowMat, shadowMatp);
    shadowMat = mult(shadowMat, translate(-l[0], -(l[1] - 1), -l[2]));

    // gl.enable(gl.blend);

    // gl.colorMask(true, true, true, false);
    // gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.uniformMatrix4fv(modelView, false, flatten(shadowMat));
    gl.uniform1i(texMap, 2);
    gl.drawArrays(gl.TRIANGLES, 6, 12);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);



}