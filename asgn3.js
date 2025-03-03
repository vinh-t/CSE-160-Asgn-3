// Assignment 3
// Vinh Tran
// viqutran@ucsc.edu

var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
    }`


var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform int u_whichTexture;
    void main() {
        if (u_whichTexture == -2) {
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == -1) {
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 0) {
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else {
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
        }
    }`


// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_whichTexture;
let g_camera;


function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
     // Initialize shaders
     if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storate location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Get storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) { 
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get storage location at u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) { 
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');   
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    // Set an initial value for matrix
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedColor = [1.0, 1.0, 1.0, 1.0];  // The color selected from the color picker
let g_selectedSize = 5; // Global variable for the size of the point
let g_selectedType = POINT; // Global variable for the type of shape
let g_globalAngle = 0.0;
let g_yellowAngle = 0.0;
let g_magentaAngle = 0.0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;

function addActionsForHtmlUI() {
    // Button Events 
    document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation = true;};
    document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation = false;};
    document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation = true;};
    document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation = false;};

    // Slider Events
    //document.getElementById('redSlide').addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
    document.getElementById('magentaSlide').addEventListener('mousemove', function() {g_magentaAngle = this.value; renderAllShapes();});
    document.getElementById('yellowSlide').addEventListener('mousemove', function() {g_yellowAngle = this.value; renderAllShapes();});

    canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };
    // Size Slider Events
    //document.getElementById('sizeSlide').addEventListener('mouseup', function() {g_selectedSize = this.value;});
    document.getElementById('angleSlide').addEventListener('mousemove', function() {g_globalAngle = this.value; renderAllShapes();});
}

function initTextures() {
    var image = new Image();
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    image.onload = function() { sendImageToTEXTURE0(image); };
    image.src = 'sky.jpg';
    return true;
}

function sendImageToTEXTURE0(image) {
    var texture = gl.createTexture();
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.uniform1i(u_Sampler0, 0);
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    console.log('texture loaded');
}

function main() {
    // Set up canvas and gl variable
    setupWebGL();

    // Connect variables to GLSL and set up GLSL shader programs
    connectVariablesToGLSL();

    // Add actions for html UI
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    //canvas.onmousemove = function(ev) { if(ev.buttons == 1) {click(ev)} };
    g_camera = new Camera();
    document.onkeydown = keydown;
    
    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    //gl.clear(gl.COLOR_BUFFER_BIT);
    //renderAllShapes();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;
function tick() {
    // Print debug information
    g_seconds = performance.now()/1000.0 - g_startTime;
    //console.log(g_seconds);

    // Update animation angles
    updateAnimationAngles();

    // Draw everything
    renderAllShapes();

    // Tell browser to update again
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(2*g_seconds));
    }
}

function keydown(ev) {
    if (ev.keyCode == 65) { // 'a' key
        g_camera.moveLeft();
    } else if (ev.keyCode == 68) { // 'd' key
        g_camera.moveRight();
    } else if (ev.keyCode == 87) { // 'w' key
        g_camera.moveForward();
    } else if (ev.keyCode == 83) { // 's' key
        g_camera.moveBackward();
    } else if (ev.keyCode == 81) { // 'q' key
        g_camera.panLeft();
    } else if (ev.keyCode == 69) { // 'e' key
        g_camera.panRight();
    }
    renderAllShapes();
    console.log(ev.keyCode);
}


function renderAllShapes() {
    var projMat = g_camera.projMat;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = g_camera.viewMat;
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var GlobalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, GlobalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    //var len = g_shapesList.length;
    //for(var i = 0; i < len; i++) {
    //    g_shapesList[i].render();
    //}

    // Draw a cube
    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.textureNum = 0;
    body.matrix.translate(-0.25, -0.75 , 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, 0.3, 0.5);
    body.render();

    // Draw a left arm
    var yellow = new Cube();
    yellow.color = [1.0, 1.0, 0.0, 1.0];
    yellow.matrix.setTranslate(0, -0.5, 0.0);
    yellow.matrix.rotate(-5, 1, 0, 0);
 
    yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);

    var yellowCoordinatesMat = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, 0.7, 0.5);
    yellow.matrix.translate(-0.5, 0, 0.0);
    yellow.render();

    // Test box
    var magenta = new Cube();
    magenta.color = [1, 0, 1, 1];
    magenta.textureNum = 0;
    magenta.matrix = yellowCoordinatesMat;
    magenta.matrix.translate(0, 0.65, 0);
    magenta.matrix.rotate(-g_magentaAngle, 0, 0, 1);
    magenta.matrix.scale(0.3, 0.3, 0.3);
    magenta.matrix.translate(-0.5, 0, -0.001);
    //box.matrix.rotate(-30, 1, 0, 0);
    //box.matrix.scale(0.2, 0.4, 0.2);
    magenta.render();

    // Ground plane
    var ground = new Cube();
    ground.color = [1,0,0,1];
    ground.matrix.translate(0,0,-1);
    ground.matrix.scale(2,0.1,2);
    ground.render();
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + "from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
