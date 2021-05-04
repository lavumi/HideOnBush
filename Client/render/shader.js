var canvas = document.getElementById("canvas");
var gl =  canvas.getContext("webgl", { alpha: false }) || canvas.getContext("experimental-webgl", { alpha: false });

var shaders = {
    simpleShader: {
        vertexShader: 'shader/simple.vert',
        fragmentShader: 'shader/simple.frag',
        attrInfo : ['aVertexPosition'],
        uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix']
    },
    colorShader: {
        vertexShader: 'shader/color.vert',
        fragmentShader: 'shader/color.frag',
        attrInfo : ['aVertexPosition', 'aVertexColor'],
        uniInfo : ['uWorldMatrix','uViewMatrix', 'uProjectionMatrix']
    },
    textureShader: {
        vtxShaderSrc: 
            "attribute vec4 aVertexPosition;"+
            "attribute vec2 uv;"+
            "uniform mat4 uVPMatrix;" + 
            "uniform mat4 uWorldMatrix;"+
            "varying mediump vec2 TexCoords;"+
            "void main() {"+
            "   gl_Position = uVPMatrix * uWorldMatrix *  aVertexPosition;"+
            "   TexCoords = uv;"+
            "}",
        fragShaderSrc: 
            "uniform sampler2D texture;"+
            "varying mediump vec2 TexCoords;"+
            "void main(){"+
            "   mediump vec4 sampled = texture2D(texture, TexCoords);"+
            "   gl_FragColor = sampled;"+
            "}",
        attrInfo : ['aVertexPosition', 'uv'],
        uniInfo : ['uVPMatrix','uWorldMatrix', 'texture' ]
    },
    fontShader: {
        vtxShaderSrc: 
            "attribute vec4 aVertexPosition;"+
            "attribute vec2 uv;"+

            "uniform mat4 uVPMatrix;" + 
            "uniform mat4 uWorldMatrix;"+
            "varying mediump vec2 TexCoords;"+
            "void main()" +
            "{" +
            "   gl_Position = uVPMatrix * uWorldMatrix *  aVertexPosition;"+
            "   TexCoords = uv;"+
            "} " ,
        fragShaderSrc: 
            "precision mediump float;" +
            "uniform vec4 color;"+
            "uniform sampler2D texture;" +
            "varying mediump vec2 TexCoords;" +
            "void main() {" +
            "    mediump vec4 sampled = texture2D(texture, TexCoords);" +
            "    gl_FragColor = vec4(0, 0, 0, sampled.a);"+
            "}" ,
        attrInfo : ['aVertexPosition', 'uv'],
        uniInfo : ['uVPMatrix','uWorldMatrix', 'texture', 'color']
    },
};

//쉐이더 컴파일
var ShaderUtil = {
    shaderInfo : {},
    initShaders: function( shaderName ){
        var buildShader = function(gl, type, source) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            //log any errors
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.log(gl.getShaderInfoLog(shader));
            }
            return shader;
        };
        var createShader =  function( shaderObj,  cb){
            var shaderProgram = gl.createProgram();
            var vertexShader, fragShader;

            vertexShader = buildShader( gl,gl.VERTEX_SHADER, shaderObj.vtxShaderSrc );
            gl.attachShader(shaderProgram, vertexShader);

            fragShader = buildShader( gl,gl.FRAGMENT_SHADER, shaderObj.fragShaderSrc );
            gl.attachShader(shaderProgram, fragShader);
            

            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                cb( null );
                return null;
            }


            var singleShaderInfo = {
                program: shaderProgram,
                attribLocations: { },
                uniformLocations: {  },
            };


            var i ,locationName;
            for( i = 0;i < shaderObj['attrInfo'].length; i++){
                locationName = shaderObj['attrInfo'][i];
                singleShaderInfo.attribLocations[ locationName ] = gl.getAttribLocation(shaderProgram, locationName);
                if(singleShaderInfo.attribLocations[ locationName ] === -1 )
                    console.warn(locationName ,  " is not used in shader ");
            }
            for( i = 0;i < shaderObj['uniInfo'].length; i++){
                locationName = shaderObj['uniInfo'][i];
                singleShaderInfo.uniformLocations[ locationName ] = gl.getUniformLocation(shaderProgram, locationName);

                if(singleShaderInfo.uniformLocations[ locationName ] === -1 )
                    console.warn(locationName ,  " is not used in shader ");
            }

            cb( singleShaderInfo );
        };



        var self = this;
        createShader( shaders[shaderName],  function( result ){
            self.shaderInfo[ shaderName ] = result;
        });
        return self.shaderInfo;
    },
};