class Socket{
    socket;
    connected = false;
    constructor( socket ,connectCallback) {
        this.socket = socket;

        let self = this;        
        this.socket.once("connect", ( res ) => {
            console.log("connected", res );
            self.connected = true;
            addConsole("Welcome"  );

            self.joinRoom( );
            
        });

        this.socket.once("disconnect", () => {
            self.connected = false;
            delete this.socket;
            addConsole("Disconnected");
            stopWaiting();
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

    joinRoom ( ){

        getInput( 'Enter Room Name' , function(roomName ){
            if ( this.connected === false ) return;

            let self = this;
            this.socket.emit("join room", roomName , (res )=>{
                if ( res.response === false ){
                    addConsole( roomName + " is not available");
                    self.joinRoom( );
                    return;
                }
                addConsole( "joined "+ roomName);
                waiting( 'Waiting Other Players');

                this.socket.on('new player' , ( res ) =>{
                    addConsole(res.name + " join room") ;
                    // console.log( 'new player join room , ', res );
     
                });

                this.socket.on('gameStart', (res) => {
                    console.log('get gameStartEvent', res);
                    addConsole("---------  GAME START ---------");
                    addConsole( "Check card : " + res.data[0] + ", " + res.data[1] );
                    stopWaiting();
                })
                
                this.socket.on('startTurn', (res) => {
                    console.log("start My turn, turncount = ", res);
                    addConsole("Its your turn");
                    addConsole("You checked " + res[0] + " " +res[1]);

                    function checkSuspect(){
                        getInput("select suspect 4,5,6" , function( input ){
                            let inputNum = Number(input);
                            if ( inputNum === 4 || inputNum === 5 || inputNum === 6){
                                console.log("emit pickSuspect");
                                self.socket.emit("pickSuspect" , inputNum );
                            }
                            else {
                                checkSuspect();
                            }
                        })
                    }
                    checkSuspect();
                });

                this.socket.on("suspectChoosed" , (res)=>{
                    console.log("suspectChoosed" , res );
                })

                this.socket.on('gameFinished' , ( res )=>{
                    console.log("gameFinished", res );
                })
            });
        }.bind(this), fastTest);

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

export default Socket;