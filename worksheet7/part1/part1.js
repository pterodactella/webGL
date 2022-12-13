var gl;
var program;
var canvas;
var light = [0, 2, 0];
var theta = 0.0;
var tetrahedronVertices = [
    [0.0, 0.0, 1.0],
    [0.0, 0.942809, -0.333333],
    [-0.816497, -0.471405, -0.333333],
    [0.816497, -0.471405, -0.333333]
]

var points = [];
var normals = [];
var projectionMat;
var positions;

var cubemap = ['/worksheet7/textures/cm_left.png',
    '/worksheet7/textures/cm_right.png',
    '/worksheet7/textures/cm_top.png',
    '/worksheet7/textures/cm_bottom.png',
    '/worksheet7/textures/cm_back.png',
    '/worksheet7/textures/cm_front.png'
];

img1 = document.createElement('img');
img1.src = cubemap[0];

img2 = document.createElement('img');
img2.src = cubemap[1];

img3 = document.createElement('img');
img3.src = cubemap[2];

img4 = document.createElement('img');
img4.src = cubemap[3];

img5 = document.createElement('img');
img5.src = cubemap[4];

img6 = document.createElement('img');
img6.src = cubemap[5];

// var images = [img1, img2, img3, img4, img5, img6];


window.onload = function init() {


    canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) { alert("Your browser does not support web gl"); return; }


    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    // gl.cullFace(gl.BACK);



    program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    positions = [].concat(tetrahedron(7, tetrahedronVertices));
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");


    var pInfo = {
        aPosition: {
            location: gl.getAttribLocation(program, 'aPosition'),
            buffer: gl.createBuffer()
        },
        p: gl.getUniformLocation(program, 'p'),
    };



    gl.bindBuffer(gl.ARRAY_BUFFER, pInfo.aPosition.buffer);
    gl.enableVertexAttribArray(pInfo.aPosition.location);
    gl.vertexAttribPointer(pInfo.aPosition.location, 3, gl.FLOAT, false, 0, 0);


    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);



    gl.bindBuffer(gl.ARRAY_BUFFER, pInfo.aPosition.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap1'), 0);


    var texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap2'), 0);


    var texture3 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture3);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img3);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap3'), 0);


    var texture4 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img4);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap4'), 0);


    var texture5 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture5);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img5);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap5'), 0);


    var texture6 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture6);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img6);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'texMap6'), 0);


    gl.uniform3fv(gl.getUniformLocation(program, 'LightPosition'), flatten(light));



    requestAnimationFrame(function render() {
        theta += 0.4;
        projectionMat = perspective(90, canvas.width / canvas.height, 1, 100);
        modelViewMat = mult(lookAt(vec3(2.0 * Math.sin(theta * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(theta * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)), scalem(1.0, 1.0, 1.0));
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(pInfo.p, false, flatten(mult(projectionMat, modelViewMat)));
        gl.drawArrays(gl.TRIANGLES, 0, positions.length);
        requestAnimationFrame(render);
    })


}


function divide_triangle(points, n, a, b, c) {
    if (n > 0) {
        var v1, v2, v3;
        v1 = normalize(mix(a, b, 0.5));
        v2 = normalize(mix(a, c, 0.5));
        v3 = normalize(mix(b, c, 0.5));

        n -= 1;
        divide_triangle(points, n, a, v1, v2);
        divide_triangle(points, n, v1, b, v3);
        divide_triangle(points, n, v3, c, v2);
        divide_triangle(points, n, v1, v3, v2);
    } else {
        triangle(points, a, b, c);
    }
}

function tetrahedron(n, tetrahedronVertices) {
    var points = [];
    var a = tetrahedronVertices[0];
    var b = tetrahedronVertices[1];
    var c = tetrahedronVertices[2];
    var d = tetrahedronVertices[3];

    divide_triangle(points, n, a, b, c);
    divide_triangle(points, n, d, c, b);
    divide_triangle(points, n, a, d, b);
    divide_triangle(points, n, a, c, d);
    return points;
}


function triangle(points, a, b, c) {

    var normal = normalize(cross(subtract(b, a), subtract(c, a)));
    normal = vec4(normal);
    normals.push(vec4(a[0], a[1], a[2], 0), vec4(b[0], b[1], b[2], 0), vec4(c[0], c[1], c[2], 0));
    points.push(a, b, c);
    // index += 3;

}