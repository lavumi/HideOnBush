

let checkMouseDown = [];

let RegistMouseDownEvent = function( object , callback){
    // console.log( typeof object.getRect === 'function' , typeof callback === 'function' );
    if ( typeof object.getRect === 'function' && typeof callback === 'function'){
        checkMouseDown.push({ object : object , callback : callback });
    }
}


let closeCurrentOpen = null;

let _checkMouseDown = function( mouseX, mouseY ){

    closeCurrentOpen = null;
    for( let i = 0 ; i < checkMouseDown.length ; i ++ ){
        let element = checkMouseDown[i];
        let rect = element.object.getRect();
        if ( rect.x < mouseX &&
            rect.x + rect.width > mouseX && 
            rect.y < mouseY && 
            rect.y + rect.height > mouseY){
                element.callback();
                closeCurrentOpen = element.callback;
                return;
            }
    }

}

canvas.addEventListener('mousedown' , (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseX = -1;
    let mouseY = -1;
    mouseX = ((e.clientX - rect.left) / rect.right - 0.5)  * ScreenSize[0];
    mouseY = (0.5-(e.clientY - rect.top)/rect.bottom) * ScreenSize[1];

    _checkMouseDown( mouseX, mouseY );
});

canvas.addEventListener('mouseup' , (e) => {
    if ( typeof closeCurrentOpen === 'function')
        closeCurrentOpen();
});
