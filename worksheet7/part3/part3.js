var gl;
var program;
var canvas;
var cubemap = [
    '/worksheet7/textures/cm_left.png',
    '/worksheet7/textures/cm_right.png',
    '/worksheet7/textures/cm_top.png',
    '/worksheet7/textures/cm_bottom.png',
    '/worksheet7/textures/cm_back.png',
    '/worksheet7/textures/cm_front.png'
];
var images = new Array(cubemap.length);
var counter = 0;

function onImageLoad() {
    counter += 1;
    if (counter === cubemap.length) {
        init();
    }
}

for (var i = 0; i < cubemap.length; i++) {
    images[i] = document.createElement('img');
    images[i].onload = onImageLoad;
    images[i].src = cubemap[i];
}

var tetrahedronVertices = [
    [0.0, 0.0, 1.0],
    [0.0, 0.942809, -0.333333],
    [-0.816497, -0.471405, -0.333333],
    [0.816497, -0.471405, -0.333333]
]

var backgroundQuad = [
    [-1.0, -1.0, 0.999],
    [1.0, -1.0, 0.999],
    [1.0, 1.0, 0.999],
    [-1.0, -1.0, 0.999],
    [1.0, 1.0, 0.999],
    [-1.0, 1.0, 0.999]
];


var vertexLocation;
var normalLocation;
var theta = 0.0;


function init() {
    canvas = document.getElementById("webgl");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("Your browser does not support web gl"); return; }



    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);


    program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);
    var positions = [].concat(backgroundQuad, tetrahedron(7, tetrahedronVertices));


    var projectionMatrix = perspective(90, canvas.width / canvas.height, 1, 100);
    var viewMatrix = mult(lookAt(vec3(2.0 * Math.sin(theta * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(theta * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)), scalem(1.0, 1.0, 1.0));

    var programInfo = {
        aPosition: {
            buffer: gl.createBuffer()
        }
    };

    vertexLocation = gl.getAttribLocation(program, 'aPosition');
    var modelViewLoc = gl.getUniformLocation(program, "modelView");
    var projectionLoc = gl.getUniformLocation(program, "projection");
    var eyewrld = gl.getUniformLocation(program, 'perspective');
    var reflective = gl.getUniformLocation(program, 'reflective');
    gl.getUniformLocation(program, "u_texture");


    gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.aPosition.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var sphereTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereTexture);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.aPosition.buffer);
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(eyewrld, flatten([0, 0, 4]));
    var orient = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    gl.bindBuffer(gl.ARRAY_BUFFER, programInfo.aPosition.buffer);
    gl.enableVertexAttribArray(vertexLocation);
    gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);

    for (var i = 0; i < orient.length; i++) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(orient[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
    }


    requestAnimationFrame(function render() {

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(mat4()));
        gl.uniformMatrix4fv(projectionLoc, false, flatten(mult(inverse4(viewMatrix), inverse4(projectionMatrix))));
        gl.uniform1i(reflective, false);
        gl.drawArrays(gl.TRIANGLES, 0, backgroundQuad.length);

        gl.uniformMatrix4fv(modelViewLoc, false, flatten(mult(projectionMatrix, viewMatrix)));
        gl.uniformMatrix4fv(projectionLoc, false, flatten(mat4()));
        gl.uniform1i(reflective, true);
        gl.drawArrays(gl.TRIANGLES, 6, positions.length - backgroundQuad.length);
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
    var d = tetrahedronVertices[3]
    divide_triangle(points, n, a, b, c);
    divide_triangle(points, n, d, c, b);
    divide_triangle(points, n, a, d, b);
    divide_triangle(points, n, a, c, d);
    return points;
}

function triangle(points, a, b, c) {

    // var normal = normalize(cross(subtract(b, a), subtract(c, a)));
    // normal = vec4(normal);
    // normals.push(vec4(a[0], a[1], a[2], 0), vec4(b[0], b[1], b[2], 0), vec4(c[0], c[1], c[2], 0));
    points.push(a, b, c);
    // index += 3;

}