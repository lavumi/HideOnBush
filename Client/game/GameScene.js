class GameScene extends tt.Node{

    characterID = [ 106011,109631 ,102031,103631, 113431,106131,110531,110931];
    classID = [7,2,5,7,29,5,2,2];

    initPos = [
        [-225,75],[-75,75],[75,75],[225,75],
        [-225,-165],[-75,-165],[75,-165],[225,-165]
    ];

    gamePos = [
        [0,-500],
        [850,0],
        [0,300],
        [-850,0],
        [-150,-165],
        [0,-165],
        [150,-165],
        [0,75]
    ];


    numberOffset = [ 80 , 100 ];

    lbNums = [];
    characters = [];
    bush;
    _loadFinishCallback;
    constructor( loadFinishCallback ){
        super();
        this._loadFinishCallback = loadFinishCallback;
        this.InitializeScene();
    }


    resize( scale ){
        this.characters.forEach(element=>{
            element.resize(scale);
        })
    }

    InitializeScene(){




        for( let i = 0 ; i < this.characterID.length ; i ++ ){
            // let character = new Spine();
            let character = new tt.Princess();
            this.characters.push( character );
            character.initialize();
            this.addChild( character );
        }
        this.bush = new tt.Sprite("bush.png");
        this.bush.setPosition([-256, -256]);
        this.bush.setVisible( false );
        this.addChild( this.bush );


        this._loadSpineCharacter(0);
    }

    _loadSpineCharacter( index ){
        let self = this;
        if ( index < this.characters.length  ){
            this.characters[index].loadCharacter( this.characterID[index], this.classID[index] , self._loadSpineCharacter.bind(self, index+1));
            // characters[index].setVisible(false);
        }
        else {
            self._loadFinishCallback();
            self._openSequence1();
        }
    }


    _openSequence1(){
        let length = this.characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            this.characters[i].setPosition( this.initPos[i]);
            this.characters[i].setIdle();
        }
        setTimeout( this._openSequence2.bind(this) , 1000);
    }
    _openSequence2(){
        //커튼 치기
        this.bush.setVisible(true);        

        //여기서 캐릭터 셔플 한번 하면 되럭 같음
        for( let i = 0 ; i < this.characters.length ; i ++ ){
            let rnd = Math.floor(Math.random() * this.characters.length );
            let temp = this.characters[i];
            this.characters[i] = this.characters[rnd];
            this.characters[rnd] = temp;
        }
        setTimeout( this._openSequence3.bind(this) , 1000);
    }
    _openSequence3(){
        let length = this.characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            // characters[i].setPosition( initPos[i][0] , initPos[i][1]);
            this.characters[i].moveTo(2, this.gamePos[i][0] , this.gamePos[i][1]);
        }

        setTimeout( this._openSequence4.bind(this) , 2000 );
    }
    _openSequence4(){
        this.characters[0].setDearIdle(-1);
        this.characters[1].setDearIdle(-1);
        this.characters[2].setDearIdle();
        this.characters[3].setDearIdle();
        this.characters[4].setIdle();
        this.characters[5].setIdle();
        this.characters[6].setIdle();
        this.characters[7].die();

        //커튼 젖히기


        setTimeout( this._openSequence5.bind(this) , 2000);

    }
    _openSequence5(){
        this.bush.setVisible( false );
        //메인 게임 시작
        function _setMouseEvent(targetCharacter , number ){
            tt.InputManager.registerMouseDownEvent(targetCharacter , 
                function(){

                    targetCharacter.swapShader();
                }
            );
        }

        this.setFirstNumbers( 3,6);

        // _setMouseEvent( this.characters[0], 3);
        // _setMouseEvent( this.characters[3], 6);
    }


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
        this._addLabelToCharacter( this.characters[3],num2);
    }
}