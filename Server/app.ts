import * as express from "express"
import * as http from "http";
import GameServer from "./Game/server";
import * as favicon from "serve-favicon";
import {Server} from 'socket.io';

class App{
    public app : express.Application;
    public port : number;
    public server : string;

    constructor(  port ){
        if ( !this.app ){
            this.app = express();
            this.port = port;
        }

        this.app.get("/",(req : express.Request , res : express.Response) =>{
            res.render('index.html')
        });

        this.app.use(favicon(__dirname + '/favicon.ico'));
        this.app.set('views',__dirname );
        this.app.set('view engine', 'ejs');
        this.app.engine('html', require('ejs').renderFile);
        this.app.use(express.static(__dirname + '/../Client'));

        var server = http.createServer(this.app);
        var socketio = new GameServer( server );
        server.listen( this.port , ()=>{ console.log( "server listen : ", this.port );});
    }
}

new App(4000);