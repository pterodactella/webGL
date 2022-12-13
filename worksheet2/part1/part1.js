var gl;

function init() {
    var canvas = document.getElementById('gl-canvas');
    gl = canvas.getContext("webgl");

    // Add event listener to the canvas
    canvas.addEventListener("click", draw);


    // Check if web gl is compatible with the setup

    if (!gl) { alert("webgl is not compatible with the setup"); return; }


    // Clear color and Define the points
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // points = [vec2(0, 0), vec2(1, 1), vec2(1, 0)];
    index = 0;
    var npoints = 0;
    verts = 100;

    // Define the program

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    // Create buffer
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, verts * sizeof['vec2'], gl.STATIC_DRAW);



    var a_Position = gl.getAttribLocation(program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);




    function draw(ev) {
        // Get the bounding box of the canvas
        var bbox = ev.target.getBoundingClientRect();
        // Get mouse position
        mousepos = vec2(2 * (ev.clientX - bbox.left) / canvas.width - 1, 2 * (canvas.height - ev.clientY + bbox.top) / canvas.height - 1);
        // velocity = vec2((mousepos[0] - offest[0]) * 0.09, (mousepos[1] - offest[1]) * 0.09);

        // Add the buffer subdata
        gl.bufferSubData(gl.ARRAY_BUFFER, index * sizeof['vec2'], flatten(mousepos));
        npoints = Math.max(npoints, ++index);
        index %= verts;


        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, index);
    }









}

window.onload = init;