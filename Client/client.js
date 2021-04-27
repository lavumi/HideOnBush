let inputField = document.getElementById('inputField');
function addConsole( text ){
    document.getElementById("consolebody").innerText += "\n" + text;
}

function defaultEvent( ev ){
    if ( ev.keyCode === 13){
        inputField.value = "";
    }
}

function getInput( descText , callback ){
    addConsole( descText );
    inputField.onkeyup = function(ev){
        if ( ev.keyCode === 13 && inputField.value.length > 0 ){
            addConsole(">"+ inputField.value);
            callback( inputField.value );   
            inputField.value = "";
            inputField.onkeyup = defaultEvent;
        }
    }
}

function waiting( waitingText ){
    inputField.disabled = true;

    // let currentValue = inputField.value;
    let count = 0;
    inputField.value = waitingText;
    setInterval( function(){
        let string = waitingText;
        count++;
        for( let i = 0 ; i < count % 3 ; i ++){
            string+= "..";
        }

        inputField.value = string;
    }, 500);string
}

class Socket{
    socket;
    connected = false;
    constructor( socket ,connectCallback) {
        this.socket = socket;

        let self = this;        
        this.socket.once("connect", () => {
            console.log("connected");
            self.connected = true;
            addConsole("Welcome"  );
            // addConsole('Connected to game Server');
            self.joinRoom( function(){});
        });

        this.socket.once("disconnect", () => {
            self.connected = false;
            delete this.socket;
        });

        this.socket.once("connect_error", (err) => {
            self.connected = false;
            delete this.socket;
            console.log(err.message);
        });

        this.socket.onAny((event, ...args) => {
            // console.log('--------' + event + '------------\n',args , '\n---------------------------');
        });
    }

    joinRoom (  cb ){

        getInput( 'Input Room Name' , function(roomName ){
            if ( this.connected === false ) return;

            this.socket.emit("join room", roomName , (res )=>{
                addConsole( "joined "+ roomName);
                waiting( 'Waiting Other Players');
                this.socket.on('new player' , ( res ) =>{
                    addConsole(res.name + " join room") ;
                    console.log( res );
                    // console.log( 'new player join room , ', res );
     
                });

                this.socket.on('gameStart', (res) => {
                    console.log('get gameStartEvent', res);
                })
                
                this.socket.on('startTurn', (res) => {
                    console.log("start My turn, turncount = ", res);
                });

                cb( res );
            });
        }.bind(this))

    }

    leaveRoom(){
        if ( this.connected === false ) return;
        this.socket.off( 'new player' );
    }

    request(route , msg , cb ){
        if ( this.connected === false ) return;
        this.socket.emit( route , msg, cb );
    }

    addEvent( route , cb ){
        if ( this.connected === false ) return;
        this.socket.on( route , cb );
    }
}


getInput("Input Your Name", function( input ){
    const socket = io({
        auth :{
            username : input
        }
    });
    
    new Socket( socket );
})

