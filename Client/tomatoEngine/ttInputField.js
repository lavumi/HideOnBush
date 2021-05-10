tt.InputField = class InputField extends tt.Node {

    text= "";
    position = [400, -470];

    buffer = null;

    constructor( ){
        super();
        this.buffer = new FontBufferBuilder();
        this.buffer.makeBuffer( this.text );
    }


    enable( enable ){
        let self = this;
        if ( enable ){
            document.addEventListener('keydown', self._keydownEvent.bind(self), false);
            document.addEventListener('keyup', self._keyupEvent.bind(self), false);
        }
        else {
            document.removeEventListener('keydown', self._keydownEvent.bind(self), false);
            document.removeEventListener('keyup', self._keyupEvent.bind(self), false);
        }
    }

    _keydownEvent( event ){
        if (event.code === 'Space')
        event.preventDefault();
        // keyMap[event.code] = true;
    }

    _keyupEvent( event ){
        this._updateUI( event.code );
    }



    _updateUI( input ){
                
        if (input.indexOf('Key') !== -1 ) {
            // return input.replace('Key', "");
            let character =  input.replace('Key', "");
            this._setString(this.text + character);
        }
        else if ( input.indexOf("Enter") !== -1 ){
            console.log("Enter PRessed");
        }
        else if ( input.indexOf("Backspace") !== -1 ) {
            this._setString(this.text .substr(0, this.text .length -1) );
        }
        else {

        }
    }

    _setString( text ){
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
