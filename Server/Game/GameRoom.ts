import Player from "./Player";

export default class Room {
    io;
    members : Player[] = [];
    roomName : string;
    cards = [0,2,3,4,5,6,7,8];

    joker = 5;

    firstTurn : number;
    currentStage : number;

    picked = [];
    gameStart = false;


    point = [];


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
            this.firstTurn = 0;
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

        this.currentStage = 0;



        //캐릭터 섞기

        let characters = [0,1,2,3,4,5,6,7];
        for( let i = 0 ; i < characters.length ; i ++ ){
            let rnd = Math.floor(Math.random() * characters.length );
            let temp = characters[i];
            characters[i] =characters[rnd];
            characters[rnd] = temp;
        }



        //카드 섞기
        for( let i = 0 ; i < this.cards.length ; i ++ ){
            let rnd = Math.floor(Math.random() * this.cards.length );
            let temp = this.cards[i];
            this.cards[i] = this.cards[rnd];
            this.cards[rnd] = temp;
        }

        this.members[0].socket.emit('gameStart' , {
            princess : characters,
            data : this.cards.slice(0 , 2 )
        });


        let char = characters.shift();
        characters.splice(3,0,char);
        this.members[1].socket.emit('gameStart' , {
            princess : characters,
            data : this.cards.slice(1 , 3 )
        });


         char = characters.shift();
        characters.splice(3,0,char);
        this.members[2].socket.emit('gameStart' , {
            princess : characters,
            data : this.cards.slice(2 , 4 )
        });

         char = characters.shift();
        characters.splice(3,0,char);
        this.members[3].socket.emit('gameStart' , {
            princess : characters,
            data : [ this.cards[3], this.cards[0]]
        });




        this.startTurn(this.currentStage);
        this.markCard(4);
    }


    startTurn( memberIndex : number ){
        //볼 카드 2장
        let index = (memberIndex + this.firstTurn ) % 4;

        let index1 = 4;
        let index2 = 5;
        if ( this.picked.length > 0 ){
            let lastPick = this.picked[ this.picked.length - 1].voted ;
            console.log("start turn -- lastpick : ", lastPick , 4,5);
            if ( lastPick === 4 ){
                index1 = 6;
            }
            else if ( lastPick === 5 ){
                index2 = 6;
            }
        }

        console.log( index1, index2 );
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
        this.picked.push( {voter : -1 , voted: index} );
    }

    pickSuspect( index ){
        if ( index > 3 || index < 7){
            this.picked.push( { 
                voter : (this.currentStage + this.firstTurn ) % 4 ,
                voted : index
             } );
            this.io.to(this.roomName).emit("suspectChoosed" , this.picked);
            this.currentStage++;
            if ( this.currentStage < 4)

                this.startTurn(this.currentStage);
            else {
                this.endGame();
            }
        }

        return -1;
    }


    endGame(){



        let jokerIndex = this.cards.indexOf( this.joker );
        let killer = -1;
        if ( jokerIndex >=4 && jokerIndex <= 6 ){
            killer = Math.min( this.cards[4],this.cards[5],this.cards[6]);
        }
        else {
            killer = Math.max( this.cards[4],this.cards[5],this.cards[6]);
        }
        let killerIndex = this.cards.indexOf(killer);
        let vote = [{ score : 0 , index : -1} , { score : 0 , index : -1},{ score : 0 , index : -1}]

        for ( let i = 1 ; i < this.picked.length ; i ++ ){
            if ( this.picked[i] === killerIndex )
                continue;

            if ( this.picked[i].voted === 4 ){
                vote[0].score++;
                vote[0].index = this.picked[i].voter;
            }
            if ( this.picked[i].voted === 5 ){
                vote[1].score++;
                vote[1].index = this.picked[i].voter;
            }
            if ( this.picked[i].voted === 6 ){
                vote[2].score++;
                vote[2].index = this.picked[i].voter;
            }
        }


        this.io.to(this.roomName).emit("gameFinished" , { 
            cards : this.cards , 
            picks : this.picked, 
            vote : vote
        });

        this.firstTurn = (this.firstTurn + 1) % 4;
    }
}
