

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

let keyMap = {};
document.addEventListener('keydown', function (event) {

    if (keyMap[event.code] === true) return;

    // if(event.code === 'ArrowRight' ){
    //     runChar( false);
    // }
    // else if (event.code === 'ArrowLeft'){
    //     runChar( true);
    // }
    if (event.code === 'KeyA') {
        //sendScore(score);

    }
    // else if (event.code === 'KeyS'){
    //     attack2Char();
    // }

    // else if (event.code === 'KeyQ'){
    //     dieChar( );
    // }
    // else if (event.code === 'KeyW'){
    //     damageedChar();
    // }

    // else if (event.code === 'KeyZ'){
    //     useSkill( 0);
    // }
    // else if (event.code === 'KeyX'){
    //     useSkill( 1);
    // }
    // else if (event.code === 'KeyC'){
    //     useSkill( 2);
    // }

    if (event.code === 'Space') {
        event.preventDefault();

    }

    keyMap[event.code] = true;

}, false);

document.addEventListener('keyup', function (event) {
    // console.log('webgl-input.js(94) :', 'keyup', event );
    keyMap[event.code] = false;
    if ( inputMode === true ){
        inputTarget.updateUI( getAlpabetFromInput(event.code));
        return;
    }

}, false);


function getAlpabetFromInput(input) {
    if (input.indexOf('Key') !== -1) {
        return input.replace('Key', "");
    }
    else if ( input.indexOf("Enter") !== -1 ){
        return "ET";
    }
    else if ( input.indexOf("Backspace") !== -1 ) {
        return "BS";
    }
    else {
        return null;
    }
}


let inputMode = false;
let inputTarget = null;
function changeToInputMode( _inputTarget){
    inputTarget = _inputTarget;
    inputMode = true;
}

function finishInputMode(){
    inputMode = false;
    inputTarget = null;
}