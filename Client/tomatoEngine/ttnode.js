tt.Node = class {

    position = [0,0];
    children = [];
    visible = true;

    constructor(){
        this.position = [0,0];
        this.children.length = 0;
    }


    setPosition( pos ){
        if ( !pos.length  && pos.length !== 2 ) return;

        this.position[0] = pos[0];
        this.position[1] = pos[1];
    }

    addChild( child ){
        this.children.push(child);
    }

    _update(dt){
        
    }

    _render(){
        
    }

    setVisible( visible ){
        this.visible = visible;
    }

    getVisible(){
        return this.visible;
    }

    getRect(){
        return {
            x : this.position[0],
            y : this.position[1] ,
            width : 0,
            height : 0,
        }
    }

    render(){
        if ( this.visible === false ) return;
        this._render();
        this.children.forEach( element =>{
            element.render();
        });
    }

    update( dt ){
        this._update(dt);
        this.children.forEach( element =>{
            element._update(dt);
        });
    }
}