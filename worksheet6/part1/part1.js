var gl;
const resolution = 64;
const columns = 8;
const rows = 8;

const vertices = [
    [-4, -1, -1, 1],
    [4, -1, -1, 1],
    [4, -1, -21, 1],
    [-4, -1, -21, 1],
];
const texCoords = [
    [-1.5, 0.0],
    [2.5, 0.0],
    [2.5, 10.0],
    [-1.5, 10.0],
];

const colors = [
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0],
    [1.0, 1.0, 1.0, 1.0]
];


var points = [];
var quad_color = [];
var tex_coord = [];



window.onload = function init() {
    var canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) {
        alert("Your browser does not support WebGL");
    }

    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);



    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    let vertecColor = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(vertecColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertecColor);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    let aPosition = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(aPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    var texel = new Uint8Array(4 * resolution * resolution);
    for (var i = 0; i < resolution; ++i)
        for (var j = 0; j < resolution; ++j) {
            var patchx = Math.floor(i / (resolution / rows));
            var patchy = Math.floor(j / (resolution / columns));
            var c = patchx % 2 !== patchy % 2 ? 255 : 0;
            var idx = 4 * (i * resolution + j);
            texel[idx] = texel[idx + 1] = texel[idx + 2] = c;
            texel[idx + 3] = 255;
        }


    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, texel);

    let textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

    let aTexCoord = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aTexCoord);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 0);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    let modelViewMatrixLoc = gl.getUniformLocation(program, "modelView");
    let projectionMatrixLoc = gl.getUniformLocation(program, "projection");



    var modelViewMat = lookAt([0, -1, -11], [0, -1, -11], [0, 1, 0]);
    var projectionMat = perspective(90, 1, 1, 21);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMat));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMat));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);


};



function quad(a, b, c, d) {

    quad_color.push(colors[a]);
    points.push(vertices[a]);
    tex_coord.push(texCoords[0]);

    quad_color.push(colors[a]);
    points.push(vertices[b]);
    tex_coord.push(texCoords[1]);


    quad_color.push(colors[a]);
    points.push(vertices[c]);
    tex_coord.push(texCoords[2]);


    quad_color.push(colors[a]);
    points.push(vertices[a]);
    tex_coord.push(texCoords[0]);


    quad_color.push(colors[a]);
    points.push(vertices[c]);
    tex_coord.push(texCoords[2]);


    quad_color.push(colors[a]);
    points.push(vertices[d]);
    tex_coord.push(texCoords[3]);

}