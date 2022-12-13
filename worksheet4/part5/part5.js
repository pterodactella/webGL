var gl;
var points = [];
var normals = [];
// var cubeVertices;
var view;
var modelView;
var projection;
var modelViewLoc;
var projectionLoc;
var tetrahedronVertices = [
    [0.0, 0.0, 1.0, 1.0],
    [0.0, 0.942809, -0.333333, 1.0],
    [-0.816497, -0.471405, -0.333333, 1.0],
    [0.816497, -0.471405, -0.333333, 1.0]
]
var index = 0;
increment = 3;
var program;
// Material properties should match up directly with the supported light sources and with the chosen reflection model.
// Thus we specify the following:
var lightPosition = [0.0, 0.0, -1.0, 0.0];
var ambient = [0.2, 0.2, 0.2, 1.0];
var diffuse = [1.0, 1.0, 1.0, 1.0];
var specular = [1.0, 1.0, 1.0, 1.0];

var shininess = 10.8;
var back_ambient = [0.33, 0.33, 0.33, 1.0];
var back_diffuse = [0.1, 0.1, 0.1, 1.0];
var back_specular = [1.0, 1.0, 1.0, 1.0];
// var back_emmision = [1.0, 1.0, 1.0, 1.0];
var theta = 0.0;



window.onload = function init() {
    var canvas = document.getElementById("webgl");

    // Retrieve the sliders

    var ambientSlider = document.getElementById("ambient");
    var diffuseSlider = document.getElementById("diffuse");
    var specularSlider = document.getElementById("specular");

    var backAmbientSlider = document.getElementById("backAmbient");
    var backDiffuseSlider = document.getElementById("backDiffuse");
    var backSpecularSlider = document.getElementById("backSpecular");
    var shininessSlider = document.getElementById("shininess");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("Your browser does not support web gl"); return; }


    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);


    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);



    modelViewLoc = gl.getUniformLocation(program, "modelView");
    projectionLoc = gl.getUniformLocation(program, "projection");

    ambientSlider.oninput = function(event) {

        ambient = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("ambient", ambient);
        render();
    }

    diffuseSlider.oninput = function(event) {

        diffuse = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("diffuse", diffuse);
        render();
    }


    specularSlider.oninput = function(event) {

        specular = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("specular", specular);
        render();
    }


    backAmbientSlider.oninput = function(event) {

        back_ambient = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("back_ambient", back_ambient);
        render();
    }



    backDiffuseSlider.oninput = function(event) {

        back_diffuse = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("back_ambient", back_ambient);
        render();
    }



    backSpecularSlider.oninput = function(event) {

        back_specular = [event.target.value, event.target.value, event.target.value, 1.0];
        // console.log("back_ambient", back_ambient);
        render();
    }

    shininessSlider.oninput = function(event) {

        shininess = event.target.value;
        // console.log("back_ambient", back_ambient);
        render();
    }


    render();

}

var modelViewMat;
var projectionMat;

function render() {

    tetrahedron(tetrahedronVertices, increment);


    ambientProduct = mult(ambient, back_ambient);
    diffuseProduct = mult(diffuse, back_diffuse);
    specularProduct = mult(specular, back_specular);

    gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "LightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "Shininess"), shininess);

    var normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vertexNormal = gl.getAttribLocation(program, "Normal");
    gl.vertexAttribPointer(vertexNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexNormal);

    // Vertex buffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vertex_Position = gl.getAttribLocation(program, 'vertex_Position');
    gl.vertexAttribPointer(vertex_Position, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(points);

    // Set light buffers

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta += 0.4;

    modelViewMat = mult(lookAt(vec3(2.0 * Math.sin(theta * Math.PI / 180.0), 2.0 * Math.sin(0.0 * Math.PI / 180.0), 2.0 * Math.cos(theta * Math.PI / 180.0)), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0)), scalem(0.5, 0.5, 0.5));
    projectionMat = ortho(-1, 1.0, -1.0, 1.0, 1, 100);

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMat));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMat));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < index; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }


    requestAnimationFrame(render)

}






function triangle(a, b, c) {

    var normal = normalize(cross(subtract(b, a), subtract(c, a)));
    normal = vec4(normal);
    normals.push(vec4(a[0], a[1], a[2], 0), vec4(b[0], b[1], b[2], 0), vec4(c[0], c[1], c[2], 0));
    points.push(a, b, c);
    index += 3;

}

// All the data for the tetrahedron is put into data using the function below:

function tetrahedron(v, n) {
    divide_triangle(v[0], v[1], v[2], n);
    divide_triangle(v[3], v[2], v[1], n);
    divide_triangle(v[0], v[3], v[1], n);
    divide_triangle(v[0], v[2], v[3], n);

}

// The devide triangle function calls itself to subdivide the object:

function divide_triangle(a, b, c, n) {
    var v1, v2, v3;
    if (n > 0) {
        // console.log("divide_triangle", n);
        v1 = normalize(mix(a, b, 0.5), true);
        v2 = normalize(mix(a, c, 0.5), true);
        v3 = normalize(mix(b, c, 0.5), true);
        divide_triangle(a, v2, v1, n - 1);
        divide_triangle(c, v3, v2, n - 1);
        divide_triangle(b, v1, v3, n - 1);
        divide_triangle(v1, v2, v3, n - 1);

    } else {
        triangle(a, b, c);


    }
}