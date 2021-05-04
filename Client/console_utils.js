
let fastTest = false;
let inputField = document.getElementById('inputField');
function addConsole( text ){
    document.getElementById("consolebody").innerText += "\n" + text;
}

function defaultEvent( ev ){
    if ( ev.keyCode === 13){
        inputField.value = "";
    }
}

function getInput( descText , callback , _fastTest ){
    addConsole( descText );
    inputField.onkeyup = function(ev){
        if ( ev.keyCode === 13 && inputField.value.length > 0 ){
            inputField.onkeyup = defaultEvent;
            addConsole(">"+ inputField.value);
            callback( inputField.value );   
            inputField.value = "";
        }
    }
    if ( _fastTest === true ){        
        inputField.onkeyup = defaultEvent;
        addConsole(">"+ "lavumi");
        callback( "lavumi");   
        inputField.value = "";
    }
}

let waitingInterval = -1;
function waiting( waitingText ){
    inputField.disabled = true;

    // let currentValue = inputField.value;
    let count = 0;
    inputField.value = waitingText;
    waitingInterval = setInterval( function(){
        let string = waitingText;
        count++;
        for( let i = 0 ; i < count % 3 ; i ++){
            string+= "..";
        }

        inputField.value = string;
    }, 500);
}

function stopWaiting(){
    clearInterval( waitingInterval );
    inputField.disabled = false;
    inputField.value = "";
}