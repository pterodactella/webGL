// Setup a viewport and clear the canvas with the color cornflowr blue
canvas = document.getElementById("part1")
var gl = canvas.getContext("webgl")
if (!gl) {
    console.log("Can't initialize webgl")

}
gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);