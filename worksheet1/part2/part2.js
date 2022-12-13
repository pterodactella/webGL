//  Load and compile a shader program, a program is composed of two shaders, a vertex shader and a fragment shader

var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' + // attribute variable
    'void main() {\n' +
    '  gl_Position = a_Position;\n' +
    '  gl_PointSize = 20.0;\n' +
    '}\n';



// Fragment shader program
var FSHADER_SOURCE =
    'void main() {\n' +
    '  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n' + // Set the point color
    '}\n';




function main() {
    var canvas = document.getElementById("part2");
    // Get the rendering context for WebGL
    var gl = canvas.getContext("webgl");
    // Only continue if WebGL is available and working
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Pass vertex position to attribute variable

    // Set the color of the canvas
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Draw a point
    gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);

    gl.vertexAttrib3f(a_Position, 1.0, 0.0, 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);


    gl.vertexAttrib3f(a_Position, 1.0, 1.0, 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);


}

window.onload = main;