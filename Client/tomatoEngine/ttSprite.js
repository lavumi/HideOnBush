tt.Sprite = class Sprite extends tt.Node {


    textureName = "";
    constructor(textureName ){
        super();
        this.textureName = textureName;
    }


    _render(){
        SpriteShader.bind();
        SpriteShader.setTexture(this.textureName);
        SpriteShader.setAttr(this.position);
        SpriteShader.draw();
    }
}