//console.log(window);
//console.dir(Matrix);
//console.dir(Vector);

var canvas, gl,
    shaderProgram, 
    verticesBuffer, verticesColorBuffer, textureCoordBuffer,
    vertexPositionAttribute, vertexColorAttribute, textureCoordAttribute,
    texture;

function start(id) {
    canvas = document.getElementById(id);

    gl = initWebGl();
    if (gl) {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //gl.enable(gl.DEPTH_TEST);
        //gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        initShaders();

        initBuffers();

        drawScene();
    }
}

function initWebGl() {
    try {
        gl = canvas.getContext('experimental-webgl');
    } catch(e) {
    }

    return gl;
}

function initShaders() {
    var fragmentShader, vertexShader;
        
    fragmentShader = getShader(gl, 'shader-fs');
    vertexShader = getShader(gl, 'shader-vs');

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, fragmentShader);
    gl.attachShader(shaderProgram, vertexShader);
    gl.linkProgram(shaderProgram);

    if (gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        gl.useProgram(shaderProgram);
    }
}

function initBuffers() {
    var vertices, colors;

    // vertex buffer
    vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];

    verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // vertex color buffer
    colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];
  
    verticesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
}

function drawScene() {
    var projectMatrix, worldMatrix, viewMatrix,
        pUniform, wUniform, vUniform;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // {{ phase 1
    // bind to a shader attribute so the shader code can access.
    vertexPositionAttribute = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.enableVertexAttribArray(vertexPositionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    vertexColorAttribute = gl.getAttribLocation(shaderProgram, 'aVertexColor');
    gl.enableVertexAttribArray(vertexColorAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
    gl.vertexAttribPointer(vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
    // }}

    
    // {{ phase 2
    //projectMatrix= makePerspective(75, canvas.width / canvas.height, 1.0, 100.0);
    projectMatrix = makeOrtho(-10.0, 10.0, -10.0, 10.0, 1.0, 100.0);

    //modelviewMatrix= Matrix.I(4);
    worldMatrix = Matrix.I(4);
    worldMatrix = worldMatrix.x(Matrix.RotationZ(0.6).ensure4x4());

    viewMatrix = Matrix.I(4);
    viewMatrix = viewMatrix.x(Matrix.Translation($V([0.0, 0.0, -95.0])).ensure4x4()); 
    
    // generate and deliver to the shader.
    pUniform = gl.getUniformLocation(shaderProgram, 'uPMatrix');
    gl.uniformMatrix4fv(pUniform, false, new Float32Array(projectMatrix.flatten()));

    wUniform = gl.getUniformLocation(shaderProgram, 'uWMatrix');
    gl.uniformMatrix4fv(wUniform, false, new Float32Array(worldMatrix.flatten()));

    vUniform = gl.getUniformLocation(shaderProgram, 'uVMatrix');
    gl.uniformMatrix4fv(vUniform, false, new Float32Array(viewMatrix.flatten()));
    // }}

    gl.drawArrays(gl.TRIANGLES, 0, 3); // (mode, first, count of point used to draw)
}

function getShader(gl, id) {
    var shaderScript = document.getElementById(id),
        theSource = '',
        shader = null;

    if (!shaderScript) return shader;

    theSource = text(shaderScript);

    if (shaderScript.type === 'x-shader/x-fragment') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === 'x-shader/x-vertex') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return shader;
    }

    gl.shaderSource(shader, theSource);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return null;

    return shader;
}

function text(elem) {
    var rst = '', currentChild;

    currentChild = elem.firstChild;
    while (currentChild) {
        if (currentChild.nodeType === currentChild.TEXT_NODE) {
            rst += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    return rst;
}


window.onload = function() {
    var canvasId = 'c';
    start(canvasId);
};
