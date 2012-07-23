// webgl util(对webgl的一些封装)
(function (window, undefined) {//{{{

    function GLUtil(elem) {
        this._elem = document.getElementById(elem);
        this._gl = this._elem.getContext('experimental-webgl');
    }

    GLUtil.prototype.gl = function () {//{{{
        return this._gl;
    };//}}}

    GLUtil.prototype.createBuffer = function (data) {//{{{
        var buffer, gl = this.gl();

        // step1. 创建buffer
        buffer = gl.createBuffer();
        // step2. bind刚创建的buffer,以便使用
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        // step3. 向buffer填充数据
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        return buffer;
    };//}}}

    GLUtil.prototype.createShader = function (str, type) {//{{{
        var shader, gl = this.gl();

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
    };//}}}

    GLUtil.prototype.createProgram = function (vstr, fstr) {//{{{
        var program, vshader, fshader,
            gl = this.gl();

        // step1. 创建program(设置shader代码, 编译shader)
        program = gl.createProgram();
        // step2. 创建shader
        vshader = this.createShader(vstr, gl.VERTEX_SHADER);
        fshader = this.createShader(fstr, gl.FRAGMENT_SHADER);
        // step3. attach相应shader到program
        gl.attachShader(program, vshader);
        gl.attachShader(program, fshader);
        // step4. 链接program
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw gl.getProgramInfoLog(program);
        }

        return program;
    };//}}}

    GLUtil.prototype.createTexture = function (image) {//{{{
        var texture, gl = this.gl();

        // step1. 创建texture
        texture = gl.createTexture();

        // step2. 绑定texture
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // step3. 设置texture的像素数据的对齐方式(align type of pixel data in byte order) 
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

        // step4. 传送texture到显存(upload texture to video memory)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // step5. 设置texture参数
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        // step6. 解绑
        gl.bindTexture(gl.TEXTURE_2D, null);

        return texture;
    };//}}}

    window.GLU = function (elem) {
        return new GLUtil(elem);
    };

})(window);//}}}


(function () {
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
})();


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
