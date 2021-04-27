export default class Room {
    io;
    members = [];
    roomName : string;
    cards = [0,1,2,3,4,5,6,7];

    crimeScene = [];
    currentTurn : number;
    picked = [];

    constructor( io ,roomName : string ){
        this.io = io;
        this.roomName = roomName;
    }



    enterRoom (  socket ){

        this.members.push( socket );
        if ( this.members.length === 4 ){
            this.startGame();
        }
        return true;
    }

    leaveRoom( socket ){
        let leave = false;
        for( let i = 0 ; i < this.members.length ; i ++ ){
            if ( this.members[i].id === socket.id ){
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

        this.currentTurn = 0;
        this.crimeScene.length =0;
        
        this.members[0].emit('gameStart' , {
            data : this.cards.slice(0 , 2 )
        });
        this.members[1].emit('gameStart' , {
            data : this.cards.slice(1 , 2 )
        });
        this.members[2].emit('gameStart' , {
            data : this.cards.slice(2 , 2 )
        });
        this.members[3].emit('gameStart' , {
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

        this.members[index].emit('startTurn' , [ this.cards[index1] , this.cards[index2] ]);
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
        this.io.to(this.roomName).emit("gameFinished" , this.cards);
    }
}
