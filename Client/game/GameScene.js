class GameScene extends tt.Scene{


    //캬 닌 미 쿄 하 무 카 치
    characterID = [ 106011,109631 ,102031,103631, 113431,106131,110531,110931];
    classID = [7,2,5,7,29,5,2,2];

    initPos = [
        [-225,75],[-75,75],[75,75],[225,75],
        [-225,-165],[-75,-165],[75,-165],[225,-165]
    ];

    gamePos = [
        [0,-500],
        [-850,0],
        [0,300],
        [850,0],
        [-150,-165],
        [0,-165],
        [150,-165],
        [0,75]
    ];


    numberOffset = [ 80 , 100 ];

    lbNums = [];
    characters = [];
    trees = [];
    _loadFinishCallback;

    _myCards = [];
    _princess = [];
    constructor(  gameData , loadFinishCallback ){
        super();

        cc.log('GameScene.js(33)' , gameData )
        this._myCards = gameData.data;
        this._princess = gameData.princess;

        this._loadFinishCallback = loadFinishCallback;
        this.InitializeScene();
    }

    resize( scale ){
        this.characters.forEach(element=>{
            element.resize(scale);
        })
    }

    InitializeScene(){
        // let spr = new tt.Sprite("bg.png");
        // spr.setPosition([-960, -456]);
        // this.addChild(spr);


        let spr = new tt.Sprite("ground2.png");
        spr.setPosition([-480, 200]);
        this.addChild(spr);

        spr = new tt.Sprite("ground2.png");
        spr.setPosition([480, 200]);
        this.addChild(spr);

        let bushPos = [
            [-240   ,  100],
            [  0   ,   100],
            [ 240   ,  100],
            [-320   ,  -50],
            [ 320   ,  -50],
        ];

        for(let i = 0 ; i < bushPos.length ; i ++ ){
            spr = new tt.Sprite("tree.png");
            spr.setPosition(bushPos[i]);
            this.addChild(spr);
            // this.trees.push(spr);
            // spr.setVisible(false);
        }


        for( let i = 0 ; i < this.characterID.length ; i ++ ){
            // let character = new Spine();
            let character = new tt.Princess();
            this.characters.push( character );
            character.initialize();
            this.addChild( character );
        }


        bushPos = [

            [-160   ,  -20],
            [   0   ,  -20],
            [ 160   ,  -20],

        ];


        for(let i = 0 ; i < bushPos.length ; i ++ ){
            spr = new tt.Sprite("tree.png");
            spr.setPosition(bushPos[i]);
            this.addChild(spr);
            this.trees.push(spr);
            spr.setVisible(false);
        }

        this._loadSpineCharacter(0);
    }

    _loadSpineCharacter( index ){
        let self = this;
        if ( index < this.characters.length  ){
            this.characters[index].loadCharacter( this.characterID[index], this.classID[index] , self._loadSpineCharacter.bind(self, index+1));
            this.characters[index].testIndes__index = index;
            // characters[index].setVisible(false);
        }
        else {
            if ( typeof self._loadFinishCallback === "function")
                self._loadFinishCallback();
            // self._openSequence1();
            self._runSequence();
        }
    }

    //#region [ OPENING SEQUENCE ]
    _sleep( ms ){
        return new Promise( resolve => setTimeout( resolve, ms));
    }
    async _runSequence(){
        this._openSequence1();
        await this._sleep( 1000 );
        this._openSequence2();
        await this._sleep(1000);
        this._openSequence4();
        await this._sleep(1000);
        this._openSequence5();
    }
    _openSequence1(){
        let length = this.characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            this.characters[i].setPosition( this.initPos[i]);
            this.characters[i].setIdle();
        }
    }
    _openSequence2(){
        //커튼 치기
        this.trees.forEach(element=>{
            element.setVisible(true);
        });
       

        let length = this.characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            // characters[i].setPosition( initPos[i][0] , initPos[i][1]);
            this.characters[i].moveTo(0.5, this.initPos[i][0] , 0);
        }


        let tempCharArr = this.characters;


        this.characters = [];

        this._princess.forEach(element=>{
            this.characters.push( tempCharArr[element]);
        })
        //여기서 캐릭터 셔플 한번 하면 되럭 같음 
        // for( let i = 0 ; i < this.characters.length ; i ++ ){
        //     let rnd = this._princess[i];
        //     let temp = this.characters[i];
        //     this.characters[i] = this.characters[rnd];
        //     this.characters[rnd] = temp;
        // }
        console.log( this._princess);


        let logText = "";
        for( let i = 0 ; i < this.characters.length ; i ++ ){
           logText += this.characters[i].testIndes__index;
            // console.log();
        }
        console.log(logText);
    }
    _openSequence4(){
        let length = this.characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            // characters[i].setPosition( initPos[i][0] , initPos[i][1]);
            this.characters[i].moveTo(1, this.gamePos[i][0] , this.gamePos[i][1]);
        }

        // setTimeout( this._openSequence5.bind(this) , 1000 );
    }
    _openSequence5(){
        this.characters[0].setDearIdle(-1);
        this.characters[1].setDearIdle();
        this.characters[2].setDearIdle();
        this.characters[3].setDearIdle(-1);
        this.characters[4].setIdle();
        this.characters[5].setIdle();
        this.characters[6].setIdle();
        this.characters[7].die();

        //커튼 젖히기
        this.trees.forEach(element=>{
            element.setVisible(false);
        });
        
        this.setFirstNumbers( this._myCards[0], this._myCards[1]);
    }

//#endregion
    

    _addLabelToCharacter( targetCharacter, num ){
        let lb = new tt.Label(num.toString());
        let rect = targetCharacter.getRect();
        lb.setPosition([ rect.x + 80, rect.y + 100]);
        lb.setVisible( false );
        lb.setColor([1,1,1,1]);
        targetCharacter.addChild( lb );

        tt.InputManager.registerMouseDownEvent( targetCharacter , function(){
            targetCharacter.swapShader();
            lb.setVisible( !lb.getVisible());
        });
    }


    setFirstNumbers( num1, num2 ){
        this._addLabelToCharacter( this.characters[0],num1);
        this._addLabelToCharacter( this.characters[1],num2);
    }


    setGameCallbacks(){
        tt.Network.on('startTurn', self._startTurn.bind(self ));

        tt.Network.on("suspectChoosed" , (res)=>{
            console.log("suspectChoosed" , res );
        })

        tt.Network.on('gameFinished' , ( res )=>{
            console.log("gameFinished", res );
        });
    }

    _startTurn( res ){
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
    }

}