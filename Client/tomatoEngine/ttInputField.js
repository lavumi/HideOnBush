tt.InputField = class InputField extends tt.Node {

    text= "";
    position = [400, -470];

    buffer = null;

    enterCallback = null;



    _keydownEvent = null;



    constructor( ){
        super();
        this.buffer = new FontBufferBuilder();
        this.buffer.makeBuffer( this.text );


        let self = this;
        this._keydownEvent = ( event )=>{
            if (event.code === 'Space')
            event.preventDefault();
            // keyMap[event.code] = true;
            self._updateUI( event.code );
        }
    }



    enable( enable ){
        let self = this;


        if ( enable ){
            document.addEventListener('keydown', this._keydownEvent, true);
            // document.addEventListener('keyup', this._keyupEvent, true);
        }
        else {
            document.removeEventListener('keydown', this._keydownEvent, true);
            // document.removeEventListener('keyup', this._keyupEvent, true);
        }
    }






    _updateUI( input ){
                
        // cc.log('ttInputField.js(44)' , input )
        if (input.indexOf('Key') !== -1 ) {
            // return input.replace('Key', "");
            let character =  (input.replace('Key', "")).toLowerCase();
            this.setString(this.text + character);
        }
        else if ( input.indexOf("Enter") !== -1 ){
            // console.log("Enter PRessed", typeof this.enterCallback );
            if ( typeof this.enterCallback === "function" ){
                this.enterCallback( this.text);
            }
        }
        else if ( input.indexOf("Backspace") !== -1 ) {
            this.setString(this.text .substr(0, this.text .length -1) );
        }
        else {

        }
    }

    setString( text ){
        if ( this.text !== text ){
            this.text = text;
            this.buffer.makeBuffer( this.text );
        }
    }

    getString(){
        return this.text;
    }

    setPosition( pos ){
        this.buffer.setPosition( pos );
    }

    _render(){
        this.buffer.render();
    }


    setEnterCallback( callback ){

        this.enterCallback = callback;
        // cc.log('ttInputField.js(85)' , this.enterCallback )
    }
}
