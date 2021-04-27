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
    }
    getRoom(){
        return this.currentGame;
    }
}
