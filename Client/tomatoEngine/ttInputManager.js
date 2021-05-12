tt.InputManager = new (class {


    _mouseDownCheckObj = [];
    _currentTarget = null;


    constructor(){
    }


    Initialize(){
        let canvas = document.getElementById("canvas");
        let self = this;

        let ScreenSize = tt.gameEngine.getInstance().getScreenSize();
        canvas.addEventListener('mousedown' , (e) => {
            const rect = canvas.getBoundingClientRect();
            let mouseX = -1;
            let mouseY = -1;
            mouseX = ((e.clientX - rect.left) / rect.right - 0.5)  * ScreenSize[0];
            mouseY = (0.5-(e.clientY - rect.top)/rect.bottom) * ScreenSize[1];
        
            self._checkMouseDown( mouseX, mouseY );
        });
        
        canvas.addEventListener('mouseup' , (e) => {
            if ( self._currentTarget !== null){
                self._currentTarget.callback();
                self._currentTarget = null;
            }
        });
    }


    registerMouseDownEvent( object, callback ){
        if ( object instanceof tt.Node && typeof object.getRect === 'function' && typeof callback === 'function'){
            this._mouseDownCheckObj.push({ object : object , callback : callback });
        }
    }

    _checkMouseDown( mouseX, mouseY ){
        this._currentTarget = null;
        for( let i = 0 ; i < this._mouseDownCheckObj.length ; i ++ ){
            let element = this._mouseDownCheckObj[i];
            let rect = element.object.getRect();
            if ( rect.x < mouseX &&
                rect.x + rect.width > mouseX && 
                rect.y < mouseY && 
                rect.y + rect.height > mouseY){
                    element.callback();
                    this._currentTarget = element;
                    return;
            }
        }
    }


})();