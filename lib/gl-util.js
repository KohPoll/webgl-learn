// 基本util
function createShader (str, type) {//{{{
    var shader;
    
    // step1. 根据type(vertext, fragment)创建shader
    shader = gl.createShader(type);
    // step2. 设置shader代码
    gl.shaderSource(shader, str);
    // step3. 编译shader
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw gl.getShaderInfoLog(shader);
    }

    return shader;
}//}}}

function createProgram (vstr, fstr) {//{{{
    var program, vshader, fshader;

    // step1. 创建program(设置shader代码, 编译shader)
    program = gl.createProgram();
    // step2. 创建shader
    vshader = createShader(vstr, gl.VERTEX_SHADER);
    fshader = createShader(fstr, gl.FRAGMENT_SHADER);
    // step3. attach相应shader到program
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    // step4. 链接program
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }

    return program;
}//}}}

function linkProgram(program) {//{{{
    var vshader = createShader(program.vshaderSource, gl.VERTEX_SHADER);
    var fshader = createShader(program.fshaderSource, gl.FRAGMENT_SHADER);

    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw gl.getProgramInfoLog(program);
    }
}//}}}

function loadProgram(vs, fs, callback) {//{{{
    var program = gl.createProgram();

    function vshaderLoaded(str) {
        program.vshaderSource = str;
        if (program.fshaderSource) {
            linkProgram(program);
            callback(program);
        }
    }

    function fshaderLoaded(str) {
        program.fshaderSource = str;
        if (program.vshaderSource) {
            linkProgram(program);
            callback(program);
        }
    }

    loadFile(vs, vshaderLoaded, true);
    loadFile(fs, fshaderLoaded, true);

    return program;
}//}}}

function loadFile(file, callback, noCache, isJson) {//{{{
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState == 1) {
            if (isJson) {
                request.overrideMimeType('application/json');
            }
            request.send();
        } else if (request.readyState == 4) {
            if (request.status == 200) {
                callback(request.responseText);
            } else if (request.status == 404) {
                throw 'File "' + file + '" does not exist.';
            } else {
                throw 'XHR error ' + request.status + '.';
            }
        }
    };

    var url = file;
    if (noCache) {
        url += '?' + (new Date()).getTime();
    }
    request.open('GET', url, true);
}//}}}


// 对requestAnimationFrame兼容处理
// var timerId = requestAnimationFrame(callback, elem); callback(elapsedTime)
// cancelRequestAnimationFrame(timerId);
(function() {//{{{
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelRequestAnimationFrame = window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    var lastTime = 0;
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var curTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (curTime - lastTime)),
                timer = null;

            timer = window.setTimeout(function() { 
                callback(curTime + timeToCall); 
            }, timeToCall);

            lastTime = curTime + timeToCall;

            return timer;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(timer) {
            clearTimeout(timer);
        };
    }
}());//}}}


// 将错误写入log
window.onerror = function(msg, url, lineno) {
	console.log(url + '(' + lineno + '): ' + msg);
}