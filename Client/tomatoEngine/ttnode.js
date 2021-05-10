tt.Node = class {

    position = [0,0];
    children = [];

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


    _render(){
        
    }

    render(){
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