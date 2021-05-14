class InputScene extends tt.Scene{

    uiFrame;
    uiTitle;
    uiInput;

    inputStage = 0;


    nameTags = [];

    testMode = true;

    constructor(loadFinishCallback){
        super();
        this.uiFrame = new tt.Sprite("optionUI.png");
        this.uiFrame.setPosition([0, 0]);
        this.addChild( this.uiFrame);

        this.uiTitle = new tt.Label("Input Your Name");
        this.uiTitle.setPosition([-200,170]);
        this.addChild( this.uiTitle );

        this.uiInput = new tt.InputField();
        this.uiInput.enable( true );
        this.uiInput.setPosition([-200,30]);
        this.addChild( this.uiInput );

        if ( typeof loadFinishCallback === "function")
            loadFinishCallback();



        let self = this;
        this.uiInput.setEnterCallback( function(input ){
            if ( input.length !== 0 ){
                self.inputCallback( input );
            }
        });
     
        

        let temp = new tt.Node();
        this.addChild(temp);


        if ( this.testMode ){
            tt.Network.connect( "lavumi" , function(){
                self._joinRoom("test1");
            });
            // this._joinRoom( "test" );
        }
    }



    setRoomNameInput(){
        this.uiTitle.setString("Input Room Name");
        this.uiInput.setString("");
        this.uiInput.enable(true);
        // this.removeChild( this.uiTitle);

    }


    inputCallback ( input ){
        this.uiInput.enable(false);
        switch ( this.inputStage ){
            case 0 : 
                tt.Network.connect( input ,function(){
                    this.inputStage++
                    this.setRoomNameInput();
                }.bind(this));
                break;
            case 1:
                this._joinRoom( input );
                // tt.Network.joinRoom(input);
                break;
        }
    }



    _joinRoom( roomname ){
        let self = this;
        tt.Network.emit( "join room", roomname , ( res )=>{
            if ( res.response === false ){
                cc.log('InputScene.js(64)' , "response fail" );
                return;
            }
            console.log("joinRoom response", res.member );


            self.uiTitle.setString("RoomMember\n");
            res.member.forEach(element => {
                self._newPlayerJoin( { name : element });
            });

            self.uiInput.enable(false);

            self.uiInput.setString("");
            tt.Network.on( "new player", self._newPlayerJoin.bind(self));
            tt.Network.on( "leave player", self._leavePlayer.bind(self));

            tt.Network.on('gameStart', self._gameStart.bind(self ));




            //todo 여기서 게임룸 생성을 시작할까...


        });
    }


    _leavePlayer( res ){
        console.log("leave player,", res );

        for( let i = 0 ; i < this.nameTags.length ; i ++ ){
            let label = this.nameTags[i];
            if ( label.getString() === res.name ){
                label.removeFromParent();
                this.nameTags.splice(i,1);
                return;
            }
        }
    }

    _newPlayerJoin( res ){
        console.log("newPlayer join ", res.name);

        let lbName = new tt.Label( res.name );
        this.addChild( lbName );
        let x = this.nameTags.length % 2;
        let y = Math.floor(this.nameTags.length / 2);
        lbName.setPosition([-200 + 200 * x, 70 - y * 60]);
        this.nameTags.push(lbName);

    }
 
    _gameStart( res ){
        console.log( res );
        let gameScene = new GameScene( res , function(){
            tt.gameEngine.getInstance().setScene(  gameScene);
        });

    }


}