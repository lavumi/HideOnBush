import { Server, Socket } from "socket.io";
import * as crypto from "crypto";
import Player from "./Player";
import GameRoom from "./GameRoom";

const randomId = () => crypto.randomBytes(8).toString("hex");
class GameServer{
    userList : { [name:string] : Player } = {};
    roomList : { [name:string] : GameRoom }= {};

    socket : Server = null!;

    constructor ( listenServer ){
        let self = this;
        this.socket = new Server().listen(  listenServer );

        this.socket.use(( socket, next)=>{
            const username = socket.handshake.auth.username;
            // console.log( " username : ", socket.id, username );
            if (!username  ) {
              return next(new Error("invalid username"));
            }
        
            // if ( !!this.userList[ username ]){
            //     return next(new Error("duplicate login"));
            // }
            // socket.username = username;
            let player = new Player( socket, username );
            this.userList[ socket.id ] = player;

            next();
        })
        
        this.socket.on("connect", socket => {
            this.addSocketEvent(socket);
        });
        
        this.socket.of("/").adapter.on("create-room", (room) => {
            // console.log(`room ${room} was created`);
        });
        
        this.socket.of("/").adapter.on("join-room", (room, id) => {
            // console.log(`socket ${id} has joined room ${room}`);
            if ( id !== room ){
                let player = this.userList[ id ]
                let name = player.userName;
                this.socket.to(room).emit("new player" , { id : id , name : name , roomName : room });
            }
        
        });
    }


    addSocketEvent( socket ){
        socket.on("join room" , (roomName :string , cb:(res:any)=>void )=>{
            if ( typeof roomName === 'string'){
                
                if ( !this.roomList[ roomName ] ){
                    this.roomList[roomName] = new GameRoom( this.socket, roomName);
                }

                let able = this.roomList[roomName].checkAvailable();
                let roomMember = this.roomList[roomName].getCurrentMember();
                if ( able ){
                    cb({
                        response : able,
                        member : roomMember
                    });
                    this.roomList[roomName].enterRoom( this.userList[socket.id] );
                }
                

            }
            cb({
                response : false
            })
    
        });
    
        socket.on('leave room' , (cb : (res : boolean)=>void) =>{
            let res = this.leaveRoom(socket);
            cb( res);
    
        })
    
        socket.on("disconnect", () => {
            this.leaveRoom(socket);
            delete this.userList[socket.id] ;
            console.log(`disconnect ${socket.id}`);
        });
    }

    leaveRoom( socket ){
        let player = this.userList[socket.id];
        let roomName = player.getRoom();
        if ( roomName ){
            let room = this.roomList[roomName];
            if ( !!room ){
                let remains = room.leaveRoom(  player );
                console.log("leave room ", remains);
                if ( remains === 0 ){
                    delete this.roomList[ roomName ];
                }
                return true;
            }
        }
    
        return false;
    }
}

export default GameServer;