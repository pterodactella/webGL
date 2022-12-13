var gl;
var points = [];
var colors = [];
var colorSelections = [
    vec3(0.0, 0.0, 0.0, 1.0), // Black
    vec3(1.0, 0.0, 0.0, 1.0), // Red
    vec3(1.0, 1.0, 0.0, 1.0), // Yellow
    vec3(0.0, 1.0, 0.0, 1.0), // Green
    vec3(0.0, 0.0, 1.0, 1.0), // Blue
    vec3(1.0, 0.0, 1.0, 1.0), // Magenta
    vec3(0.0, 1.0, 1.0, 1.0), // Cyan
    vec3(1.0, 1.0, 1.0, 1.0), // White
    vec3(0.3921, 0.5843, 0.9294, 1.0) // Cornflower

];

function init() {
    // First get all the elements from the html file
    var canvas = document.getElementById('gl-canvas');
    var pointMenu = document.getElementById('pointColor');
    var canvasMenu = document.getElementById('canvasColor');
    var clearButton = document.getElementById('clearButton');

    // Get the context and check ig gl is compatible
    gl = canvas.getContext("webgl");
    if (!gl) { alert("webgl is not compatible with the setup"); return; }

    // Clear color
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Define the program
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Add event listener to the canvas
    canvas.addEventListener("click", function(ev) {
        // Get the bounding box of the canvas
        var bbox = ev.target.getBoundingClientRect();
        // Get mouse position
        console.log("clicked canvas");
        var mousepos = vec2(2 * (ev.clientX - bbox.left) / canvas.width - 1, 2 * (canvas.height - ev.clientY + bbox.top) / canvas.height - 1);
        console.log('mouse position: ', mousepos);

        colors.push(colorSelections[pointMenu.selectedIndex]);
        console.log('selection: ', pointMenu.selectedIndex);
        points.push(mousepos);

        // color buffer
        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        // vertex color setup
        var aColor = gl.getAttribLocation(program, "a_Color");
        gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aColor);

        // vertex buffer setup
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

        // vertex position setup
        var aPosition = gl.getAttribLocation(program, "a_Position");
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPosition);


        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, points.length);

    });

    // Add event listener to clear the canvas
    clearButton.addEventListener("click", function clearCanvas() {
        console.log("clear button clicked");
        var canvasColor = colorSelections[canvasMenu.selectedIndex];
        console.log("canvas color", canvasColor);
        gl.clearColor(canvasColor[0], canvasColor[1], canvasColor[2], canvasColor[3]);
        points = [];
        colors = [];
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, points.length);

    })

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, points.length);


}

window.onload = init;