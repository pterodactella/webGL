var gl;

function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't compatible with your setup"); }

    var points = [
        vec3(0.0, 0.0, 0.0)
    ];

    var color = [
        vec3(1.0, 1.0, 1.0)
    ];

    var n = 100;
    var r = 0.30;

    for (var i = 0; i <= n; i++) {
        theta = 2 * Math.PI * i;
        points.push(vec3(r * Math.cos(theta / n), r * Math.sin(theta / n)));
        color.push(vec3(1.0, 1.0, 1.0));
    }

    var theta = 0.0;

    //  clear canvas color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    //  initialize the vertex shader and the fragment shader
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(color), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    var thetaLocation = gl.getUniformLocation(program, "theta");
    gl.uniform1f(thetaLocation, theta);

    function draw() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        theta += 0.01
        gl.uniform1f(thetaLocation, theta);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, points.length);

        window.webkitRequestAnimationFrame(draw);
    }

    draw();
};

window.onload = init();