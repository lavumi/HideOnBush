class FontBufferBuilder {
    vertexCount = 0;
    dirty = false;
    buffer= {
        vertex: null,
        uv: null,
        indices: null,                        
        color : [0,0,0,1],
        position : null,
    };


    constructor(){

    }

    makeBuffer( text   ){
        var positions = [];
        var uv = [];
        var indices = [];

        //console.log( string + " make buffer!!");

        let allFontData = tt.FontRenderer.getFontData();
        var fontStartPos = [0, 0];
        this.vertexCount = 0;
        for (var i = 0; i < text.length; i++) {

            if (text[i] === " ") {
                fontStartPos[0] += 30 / 512;
                continue;
            }
            var fontData = allFontData[text[i].toLowerCase()];;

            var X = fontData.rect[0] / 512;
            var Y = fontData.rect[1] / 512;
            var offsetX = fontData.offset[0] / 512;
            var offsetY = fontData.offset[1] / 512
            var width = fontData.rect[2] / 512;
            var height = fontData.rect[3] / 512;

            var minX = offsetX + fontStartPos[0];
            var minY = offsetY + fontStartPos[1];
            var minZ = 0;
            var maxX = offsetX + fontStartPos[0] + width;
            var maxY = offsetY + fontStartPos[1] + height;
            var maxZ = 0;


            fontStartPos[0] += fontData.width / 512;

            positions.push(minX);
            positions.push(minY);
            positions.push(minZ);

            positions.push(minX);
            positions.push(maxY);
            positions.push(minZ);

            positions.push(maxX);
            positions.push(maxY);
            positions.push(minZ);

            positions.push(maxX);
            positions.push(minY);
            positions.push(minZ);






            uv.push(X);
            uv.push(Y + height);

            uv.push(X);
            uv.push(Y);

            uv.push(X + width);
            uv.push(Y);

            uv.push(X + width);
            uv.push(Y + height);



            indices.push(0 + 4 * this.vertexCount / 6);
            indices.push(1 + 4 * this.vertexCount / 6);
            indices.push(2 + 4 * this.vertexCount / 6);

            indices.push(0 + 4 * this.vertexCount / 6);
            indices.push(2 + 4 * this.vertexCount / 6);
            indices.push(3 + 4 * this.vertexCount / 6);
            this.vertexCount += 6;

        }


        gl.deleteBuffer( this.buffer.vertex );
        gl.deleteBuffer( this.buffer.uv );
        gl.deleteBuffer( this.buffer.indices );

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv), gl.STATIC_DRAW);

        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(indices), gl.STATIC_DRAW);

        this.buffer.vertex = vertexBuffer;
        this.buffer.uv = uvBuffer;
        this.buffer.indices = indexBuffer;

        this.dirty = false;
    }

    setColor( color ){
        this.buffer.color = color;
    }

    setPosition( position ){
        this.buffer.position = position;
    }

    render(){
        tt.FontRenderer.render( this.buffer , this.vertexCount);
    }

}

tt.Label = class Label extends tt.Node {

    text= "";
    position = [400, -470];

    buffer = null;

    constructor( text , color ){
        super();
        this.text = text ? text : "";
        this.buffer = new FontBufferBuilder();
        this.buffer.makeBuffer( this.text );
    }

    setColor( color ){
        if ( color.length === 4 ){
            this.buffer.setColor( color );
        }
    }

    setString( text ){
        if ( this.text !== text ){
            this.text = text;
            this.buffer.makeBuffer( this.text );
        }
    }

    setPosition( pos ){
        this.buffer.setPosition( pos );
    }

    _render(){
        this.buffer.render();
    }
}



