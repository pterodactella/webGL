let gl;
var program;
var ANGLE_STEP = 10.0;
var count = 0;
var vertices = new Float32Array([ // Vertex coordinates
    1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, // v0-v1-v2-v3 front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, // v0-v3-v4-v5 right
    1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, // v0-v5-v6-v1 up
    -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, // v1-v6-v7-v2 left
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, // v7-v4-v3-v2 down
    1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0 // v4-v7-v6-v5 back
]);

var colors = new Float32Array([ // Colors
    0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0, 0.5, 0.5, 1.0,
    0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0.1, 0.1, 0.5, 0.1,
    1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4, 1.0, 0.4, 0.4,
    1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4,
    0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7,
    0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0, 0.4, 1.0, 1.0
]);

var indices = new Uint8Array([ // Indices of the vertices
    0, 1, 2, 0, 2, 3, // front
    4, 5, 6, 4, 6, 7, // right
    8, 9, 10, 8, 10, 11, // up
    12, 13, 14, 12, 14, 15, // left
    16, 17, 18, 16, 18, 19, // down
    20, 21, 22, 20, 22, 23 // back
]);

const n = 36;

var orient = 'Landscape';

window.onload = function init() {
    // Initialize the canvas
    var canvas = document.getElementById('webgl');
    var hud = document.getElementById('hud');
    var ctx = hud.getContext('2d');
    gl = canvas.getContext("webgl");


    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Initialize the bffers
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, 'a_position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

    var a_Color = gl.getAttribLocation(program, 'a_color');
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Get the uniform locations
    var u_matrix = gl.getUniformLocation(program, 'u_matrix');
    var u_Clicked = gl.getUniformLocation(program, 'u_Clicked');
    var u_Resized = gl.getUniformLocation(program, 'u_Resized');

    if (!u_matrix || !u_Clicked || !u_Resized) {
        console.log('Failed to get the storage location of uniform variables');
        return;
    }

    // Get the viewMatrix
    var viewProjectionMatrix = new Matrix4();
    viewProjectionMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 50.0);
    viewProjectionMatrix.lookAt(0.0, 0.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);

    gl.uniform1i(u_Clicked, 0);
    gl.uniform1i(u_Resized, 0);
    var currentAngle = 0.0;

    hud.onmousedown = function(ev) { // Mouse is pressed
        var x = ev.clientX,
            y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();
        if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
            // If pressed position is inside <canvas>, check if it is above object
            var x_in_canvas = x - rect.left,
                y_in_canvas = rect.bottom - y;
            var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjectionMatrix, u_matrix);
            if (picked) {
                console.log('The cube was selected! ');
                count++;
            };
        }
    }

    // hud.addEventListener('devicemotion', (event) => {
    //     console.log(`${event.acceleration.x} m/s2`);
    // });



    var tick = function() { // Start drawing
        currentAngle = animate(currentAngle);
        draw2D(ctx, currentAngle, count); // Draw 2D
        draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix);
        requestAnimationFrame(tick, canvas);
    };
    tick();


    window.onresize = function(ev) {
        // console.log(getBrowser());
        // console.log("canvas is being resized")
        if (getBrowser() == "Safari" || getBrowser() == "unknown") {
            orient = getOrientation();
        } else {
            orient = screen.orientation.type + " " + screen.orientation.angle
            screen.orientation.addEventListener("orientationchange", function(e) {
                orient = screen.orientation.type + " " + screen.orientation.angle;
                return orient;
            });
        }
        var x = ev.clientX,
            y = ev.clientY;

        var x_in_canvas = x,
            y_in_canvas = -y;


        var resized = checkResize(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjectionMatrix, u_matrix);
        if (resized) {
            console.log("canvas is being resized")
        }

    }
}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function checkResize(gl, n, x, y, currentAngle, u_Resized, viewProjectionMatrix, u_matrix) {
    var resized = false;
    gl.uniform1i(u_Resized, 1); // Pass true to u_Resized
    draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix); // Draw cube with red
    resized = true;
    sleep(0.5).then(() => {
        gl.uniform1i(u_Resized, 0); // Pass false to u_Resized(rewrite the cube)
        draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix); // Draw the cubes
    });
    return resized;
}



function check(gl, n, x, y, currentAngle, u_Clicked, viewProjectionMatrix, u_matrix) {
    var picked = false;
    gl.uniform1i(u_Clicked, 1); // Pass true to u_Clicked
    draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix); // Draw cube with red
    // Read pixel at the clicked position
    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    if (pixels[0] == 255) // The mouse in on cube if R(pixels[0]) is 255
        picked = true;

    gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked(rewrite the cube)
    draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix); // Draw the cube

    return picked;
}


// Model view projection matrix
function draw(gl, n, currentAngle, viewProjectionMatrix, u_matrix) {
    var g_MvpMatrix = new Matrix4();
    // Caliculate The model view projection matrix and pass it to u_matrix
    g_MvpMatrix.set(viewProjectionMatrix);
    g_MvpMatrix.rotate(currentAngle, 1.0, 0.0, 0.0); // Rotate appropriately
    g_MvpMatrix.rotate(currentAngle, 0.0, 1.0, 0.0);
    g_MvpMatrix.rotate(currentAngle, 0.0, 0.0, 1.0);
    gl.uniformMatrix4fv(u_matrix, false, g_MvpMatrix.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear buffers
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); // Draw
}


var last = Date.now(); // Last time that this function was called
function animate(angle) {
    var now = Date.now(); // Calculate the elapsed time
    var elapsed = now - last;
    last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

function draw2D(ctx, currentAngle, count) {
    ctx.clearRect(0, 0, 800, 800); // Clear <hud>
    // // Draw triangle with white lines
    // ctx.beginPath(); // Start drawing
    // ctx.moveTo(120, 20);
    // ctx.lineTo(200, 150);
    // ctx.lineTo(40, 150);
    // ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Set white to color of lines
    ctx.stroke(); // Draw Triangle with white lines
    // Draw white letters
    ctx.font = '18px "Times New Roman"';
    ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Set white to the color of letters
    ctx.fillText('HUD: Head Up Display', 10, 20);
    ctx.fillText('Current Angle: ' + Math.floor(currentAngle), 10, 40);
    ctx.fillText('Times The Cube Was Clicked: ' + count, 10, 60);
    ctx.fillText('Current Orientation of Screen: ' + orient, 10, 80);
    ctx.fillText('Used browser:  ' + getBrowser(), 10, 100);

}

// For browsers that do not support the screen api
function getOrientation() {
    orient = window.innerWidth > window.innerHeight ? "Landscape" : "Portrait";
    return orient;
}

// window.onresize = function() {
//     if (getBrowser() == "Safari" || getBrowser() == "unknown") {
//         orient = getOrientation();
//     } else {
//         orient = screen.orientation.type + " " + screen.orientation.angle
//     }

// }


function getBrowser() {
    if (navigator.userAgent.indexOf("Chrome") != -1) {
        return "Chrome";
    } else if (navigator.userAgent.indexOf("Opera") != -1) {
        return "Opera";
    } else if (navigator.userAgent.indexOf("MSIE") != -1) {
        return "IE";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
        return "Firefox";

    } else if (navigator.userAgent.indexOf("Safari") != -1) {
        return "Safari";

    } else {
        return "unknown";
    }
}
// For browsers that do support the screen api 
screen.orientation.addEventListener("orientationchange", function(e) {
    orient = screen.orientation.type + " " + screen.orientation.angle;
    return orient;
});