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
        this.socket = new Server().listen(  listenServer );

        this.socket.use(( socket, next)=>{
            const username = socket.handshake.auth.username;
            // console.log( " username : ", socket.id, username );
            if (!username  ) {
              return next(new Error("invalid username"));
            }
        
            if ( !!this.userList[ username ]){
                return next(new Error("duplicate login"));
            }
            // socket.username = username;
            let player = new Player( socket, username );
            this.userList[ socket.id ] = player;

            next();
        })
        
        this.socket.on("connect", (socket) => {
            socket.on("join room" , (roomName :string , cb:(res:boolean)=>void )=>{
                if ( typeof roomName === 'string'){
                    socket.join( roomName );
                    if ( !this.roomList[ roomName ] ){
                        this.roomList[roomName] = new GameRoom( this.socket, roomName);
                    }
                    let res = this.roomList[roomName].enterRoom( socket );
                    if ( res === true  ){
                        this.userList[socket.id].joinRoom( roomName );
                    }
                    //todo 여기서 현재 방에 입장해 있는 사람 리스트도 줘야함
                    cb(res);
                }
        
            });
        
            socket.on('leave room' , (cb : (res : boolean)=>void) =>{
                let res = leaveRoom.bind(this, socket);
                cb( res);
        
            })
        
            socket.on("disconnect", () => {
                leaveRoom.bind(this, socket);
                delete this.userList[socket.id] ;
                // console.log(`disconnect ${socket.id}`);
            });
        });
        
        
        function leaveRoom( socket ){
            let roomName = this.userList[socket.id].getRoom();
            if ( roomName ){
                let room = this.roomList[roomName];
                if ( !!room ){
                    let remains = room.leaveRoom(  socket );
                    if ( remains === 0 ){
                        delete this.roomList[ roomName ];
                    }
                    return true;
                }
            }
        
            return false;
        }
        
        
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
}

export default GameServer;