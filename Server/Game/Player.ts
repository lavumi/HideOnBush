export default class Player{

    socket;
    userName;
    currentGame;

    constructor(socket, userName){
        this.socket = socket;
        this.userName = userName;
    }

    joinRoom ( roomName ){
        this.currentGame = roomName;
        this.socket.join( roomName );
    }
    getRoom(){
        return this.currentGame;
    }
}
