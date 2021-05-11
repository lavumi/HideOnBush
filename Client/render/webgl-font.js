class FontRenderer  {
    //#region  공통 데이터 세팅

    shaderData = {
        program: null,//shaderProgram,
        attribLocations: {},
        uniformLocations: {},
    };

    myFontData = {};
    fontAtlas = null;

    constructor(){

    }

    initialize(callback){
        this._loadFont(callback);
    }

    _loadFont( callback ) {
        let self = this;
        function loadDoc() {
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    parse(this);
                }
            };
            req.open("GET", "Resources/font/myFont.xml", true);
            req.send();
        }

        function parse(xml) {
            var i;
            var xmlDoc = xml.responseXML;
            var chars = xmlDoc.getElementsByTagName("Char");
            for (var i = 0; i < chars.length; i++) {

                var char = chars[i].getAttribute('code');
                var width = chars[i].getAttribute('width');
                var offset = chars[i].getAttribute('offset').split(' ');
                var rect = chars[i].getAttribute('rect').split(' ');

                self.myFontData[char] = {
                    width: width,
                    offset: offset,
                    rect: rect
                }

            }

            self._loadFontAtlas('myFont' , callback );
        }

        loadDoc();
    };

    _loadFontAtlas(atlas , callback ) {
        var texture = gl.createTexture();
        var image = new Image();

        let self = this;
        image.onload = function () {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            self.fontAtlas = texture;
            self._loadShader();
            callback();
        };

        image.onerror = function (e) {
            console.error("image load fail :" + atlas + " error : " + e);
        }

        image.src = 'Resources/font/' + atlas + ".png";
    }

    _loadShader() {
        this.shaderData = ShaderUtil.initShaders('fontShader').fontShader;
    };

    _setFont() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.fontAtlas);
        gl.uniform1i(this.shaderData.uniformLocations['texture'], 0);
    };



    //#endregion

    _bindBuffer( buffer ){
        let ScreenSize = tt.gameEngine.getInstance().getScreenSize();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer.vertex);
        gl.vertexAttribPointer(
            this.shaderData.attribLocations['aVertexPosition'],
            3, // position x, y, z 3개
            gl.FLOAT,
            false,
            0,
            0);
        gl.enableVertexAttribArray(
            this.shaderData.attribLocations['aVertexPosition']);


        if (this.shaderData.attribLocations.hasOwnProperty('uv')) {

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer.uv);
            gl.vertexAttribPointer(
                this.shaderData.attribLocations['uv'],
                2,
                gl.FLOAT,
                true,
                0,
                0);

            gl.enableVertexAttribArray(
                this.shaderData.attribLocations['uv']);
        }


        if (this.shaderData.uniformLocations.hasOwnProperty('color')) {

            gl.uniform4fv(
                this.shaderData.uniformLocations['color'],
                buffer.color);
        }


        gl.uniformMatrix4fv(
            this.shaderData.uniformLocations['uVPMatrix'],
            false,
            [2, 0, 0, 0,
                0, 2, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1]);


        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indices);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


        var x = buffer.position[0];
        var y = buffer.position[1];

        var width = 512 / ScreenSize[0];
        var height = 512 / ScreenSize[1];

        var position = {
            x: x / ScreenSize[0],
            y: y / ScreenSize[1],
        };

        gl.uniformMatrix4fv(
            this.shaderData.uniformLocations['uWorldMatrix'],
            false,
            [width, 0, 0, 0,
                0, height, 0, 0,
                0, 0, 1, 0,
                position.x, position.y, 0, 1]);
    }

    getFontData(){
        return this.myFontData;
    }

    render (  buffer, vertexCount ){
        gl.useProgram(this.shaderData.program);
        this._setFont();
        this._bindBuffer( buffer );
        gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_SHORT, 0);
    }


    // return {
    //     loadFont: loadFont,
    //     getFontData : _getFontData,
    //     render : _render
    // }
}