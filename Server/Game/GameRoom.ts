import Player from "./Player";

export default class Room {
    io;
    members : Player[] = [];
    roomName : string;
    cards = [0,1,2,3,4,5,6,7];

    crimeScene = [];
    currentTurn : number;
    picked = [];
    gameStart = false;

    constructor( io ,roomName : string ){
        this.io = io;
        this.roomName = roomName;
    }

    checkAvailable(){
        if ( this.members.length >=4  || this.gameStart === true )
         return false;
        return true;
    }

    getCurrentMember(){
        let res = [];
        for( let i = 0 ; i < this.members.length ; i ++ ){
            res.push( this.members[i].userName );
        }
        return res;
    }

    enterRoom (  player : Player ){
        this.members.push( player );
        player.joinRoom( this.roomName );
        if ( this.members.length === 4 ){
            this.startGame();
        }
        return
    }

    leaveRoom( player : Player ){
        let leave = false;
        for( let i = 0 ; i < this.members.length ; i ++ ){
            if ( this.members[i].socket.id === player.socket.id ){
                this.members.splice( i , 1);
                leave = true;
                break;
            }
        }

        if ( leave === false ){
            return -1;
        }

        return this.members.length;
    }

    startGame(){
        //shuffle
        this.gameStart = true;
        this.currentTurn = 0;
        this.crimeScene.length =0;
        
        this.members[0].socket.emit('gameStart' , {
            data : this.cards.slice(0 , 2 )
        });
        this.members[1].socket.emit('gameStart' , {
            data : this.cards.slice(1 , 3 )
        });
        this.members[2].socket.emit('gameStart' , {
            data : this.cards.slice(2 , 4 )
        });
        this.members[3].socket.emit('gameStart' , {
            data : [ this.cards[3], this.cards[0]]
        });

        this.startTurn(this.currentTurn++);
        
    }


    startTurn( index ){
        //볼 카드 2장
        let index1 = 4;
        let index2 = 5;
        if ( this.picked.length > 0 ){
            let lastPick = this.picked[ this.picked.length - 1] ;
            if ( lastPick === 4 ){
                index1 = 6;
            }
            else if ( lastPick === 5 ){
                index2 = 6;
            }
        }

        this.members[index].socket.emit('startTurn' , [ this.cards[index1] , this.cards[index2] ]);
        this.members[index].socket.once('pickSuspect' , this.pickSuspect.bind(this));
    }

    /**
     * 안본 카드의 위치 ( 선턴만 보내면 된다.)
     * @param index
     */
    markCard( index  ){
        if ( index === 4 || index === 5){
            let temp = this.cards[index]
            this.cards[index] = this.cards[6];
            this.cards[6] = temp;
        }
        this.picked.push( index );
    }

    pickSuspect( index ){
        console.log( index );
        if ( index > 3 || index < 7){
            this.picked.push( index );
            this.io.to(this.roomName).emit("suspectChoosed" , this.picked);
            if ( this.currentTurn < 4)
                this.startTurn( this.currentTurn++ );
            else {
                this.endGame();
            }
        }

        return -1;
    }

    endGame(){
        this.io.to(this.roomName).emit("gameFinished" , {cards : this.cards , picks : this.picked });
    }
}
