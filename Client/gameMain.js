var canvas;
var gl;
var ScreenSize = [1920, 1080];

(function(){
    getInput("Enter Your Name", function( input ){
        const socket = io({
            reconnection : false,
            auth :{
                username : input
            },
        });
        new Socket( socket );
    }, fastTest );
})();


function GameMain() {

    //#region 렌더링 변수
    var lastFrameTime = Date.now() / 1000;

    var bgColor = [0, 0.5, 1, 1];


    //#endregion


    //#region inGame val
    var characters = [];
    var characterID = [106011,109631 ,102031,103631, 113431,106131,110531,110931];
    var classID = [7,2,5,7,29,5,2,2];


    var initPos = [
        [-225,75],[-75,75],[75,75],[225,75],
        [-225,-165],[-75,-165],[75,-165],[225,-165]
    ];

    var gamePos = [
        [0,-500],
        [850,0],
        [0,300],
        [-850,0],
        [-150,-165],
        [0,-165],
        [150,-165],
        [0,75]
    ];
    //#endregion

    function init() {
        canvas = document.getElementById("canvas");
        var config = { alpha: false };
        gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
        if (!gl) {
            alert('WebGL is unavailable.');
            return;
        }


        initFont();
        initUI();
        for( let i = 0 ; i < characterID.length ; i ++ ){
            let character = new Spine();
            characters.push( character );
            character.init();
        }



        function loadSpineCharacter( index ){
            if ( index < characters.length  ){
                characters[index].load( characterID[index], classID[index] , loadSpineCharacter.bind(null, index+1));
                characters[index].setVisible(false);
            }
            else {
                startGame();
            }
        }

        TextureUtil.loadTexture(function () {
            loadSpineCharacter(0);
        })


    }


    function initFont(){
        FontSystem.loadFont();
        FontSystem.setString("number" , "?");
        FontSystem.setColor("number", [1,1,1,1]);
        FontSystem.setPosition("number", [0,0]);
        FontSystem.setVisible( "number", false);




    }

    function initUI(){
        FontSystem.setString("UITitle" , "Input Your Name");
        FontSystem.setPosition("UITitle", [-200,140]);

        FontSystem.setString("inputText" , "_");
        FontSystem.setPosition("inputText", [-200,0]);
    }



    var prevTime = 0;
    function printDeltaTime() {
        if ((Date.now() - prevTime) > 33) {
            var currentdate = new Date();
            var datetime = "Last Sync: "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

            console.log(" 1 " + (Date.now() - prevTime) + " ++++ " + datetime);

        }
        prevTime = Date.now();
    };



    function showInputUI(){

        let _string = "";
        function inputField(){

            function _updateUI( string ){
                
                if ( string === null ){
                    
                }
                else if ( string === "ET"){
                    const socket = io({
                        reconnection : false,
                        auth :{
                            username : input
                        },
                    });
                    new Socket( socket );
                }
                else if ( string === "BS"){
                    _string = _string.substr(0, _string.length -1);
                }
                else if ( string.length === 1){
                    _string = _string + string;
                }

  
                FontSystem.setString("inputText", _string);
            }

            return{
                updateUI : _updateUI
            }
        }
        changeToInputMode( inputField() );
    }

    function showInputUI2(){


        FontSystem.setString("UITitle", "Input RoomCode")
        let _string = "";
        function inputField(){

            function _updateUI( string ){
                
                if ( string === null ){
                    
                }
                else if ( string === "ET"){

                }
                else if ( string === "BS"){
                    _string = _string.substr(0, _string.length -1);
                }
                else if ( string.length === 1){
                    _string = _string + string;
                }

  
                FontSystem.setString("inputText", _string);
            }

            return{
                updateUI : _updateUI
            }
        }
        // changeToInputMode( inputField() );
    }

    function update() {

        var now = Date.now() / 1000;
        var delta = now - lastFrameTime;
        lastFrameTime = now;


        // characters[0].update(delta);
        characters.forEach(element=>{
            element.update(delta);
        })

        render(delta);
        requestAnimationFrame(update);

    }

    function render(delta) {

        gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        resize();


        drawUI();

        characters.forEach(element=>{
            element.render(delta, false);
        });

        FontSystem.draw();
    }

    function drawUI( uiType ) {
        SpriteShader.bind();
        SpriteShader.setTexture("optionUI.png");
        SpriteShader.setAttr([-256, -256]);
        SpriteShader.draw();

        FontSystem.setVisible("UITitle", true);
        FontSystem.setVisible("inputText", true);



    };

    function resize() {

        var w = ScreenSize[0];
        var h = ScreenSize[1];

        var scaleX = window.innerWidth * devicePixelRatio / w;
        var scaleY = window.innerHeight * devicePixelRatio / h;
        var scale = Math.min(scaleX, scaleY);
        if (scale > 1)
            scale = 1;


        w = Math.floor(w * scale / 10) * 10;
        h = Math.floor(h * scale / 10) * 10;

        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
        }


        characters.forEach(element=>{
            element.resize(scale);
        })


        gl.viewport(0, 0, canvas.width, canvas.height);
    }


    function startGame() {

        // characters[0].setDearIdle();
        // characters[1].setDearIdle(-1);
        // characters[2].setDearIdle(-1);
        // characters[3].setDearIdle();
        // characters[4].setIdle();
        // characters[5].setIdle();
        // characters[6].setIdle();
        // characters[7].die();

        requestAnimationFrame(update);

        showInputUI( 0 );
        // openSequence1();

    }

    function openSequence1(){
        let length = characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            characters[i].setPosition( initPos[i][0] , initPos[i][1]);
            characters[i].setIdle();
        }
        setTimeout( openSequence2 , 1000);
    }
    function openSequence2(){
        //커튼 치기
        //여기서 캐릭터 셔플 한번 하면 되럭 같음
        for( let i = 0 ; i < characters.length ; i ++ ){
            let rnd = Math.floor(Math.random() * characters.length );
            let temp = characters[i];
            characters[i] = characters[rnd];
            characters[rnd] = temp;
        }




        setTimeout( openSequence3 , 1000);
    }
    function openSequence3(){
        let length = characters.length;
        for( let i = 0 ; i < length  ; i ++ ){
            // characters[i].setPosition( initPos[i][0] , initPos[i][1]);
            characters[i].moveTo(2, gamePos[i][0] , gamePos[i][1]);
        }

        setTimeout( openSequence4 , 2000 );
    }
    function openSequence4(){
        characters[0].setDearIdle(-1);
        characters[1].setDearIdle(-1);
        characters[2].setDearIdle();
        characters[3].setDearIdle();
        characters[4].setIdle();
        characters[5].setIdle();
        characters[6].setIdle();
        characters[7].die();

        //커튼 젖히기


        setTimeout( openSequence5 , 2000);

    }
    function openSequence5(){
        //메인 게임 시작

        _setMouseEvent( characters[0], 3);
        _setMouseEvent( characters[3], 6);
    }

    function _setMouseEvent(targetCharacter , number ){
        RegistMouseDownEvent(targetCharacter , 
            function(){
                FontSystem.toggle("number" );
                FontSystem.setString("number", number.toString());
                let rect = targetCharacter.getRect();

                FontSystem.setPosition("number" , [ rect.x + 80, rect.y + 100]);
                targetCharacter.swapShader();
            }
        );
    }



    return {
        init: init
    }
    //endregion
}

var main = new GameMain();
main.init();



/**
 * 게임 플로우
 * 1. 캐릭터들 중앙에 모여있음
 * 2. 중앙 부위에 커튼이 쳐짐
 * 3. 4명의 케릭터가 각각의 위치로 이동
 * 4. 커튼이 젖혀지면 남은 4명중 1명이 죽어있음
 * 5. 게임 플레이 로직 시작
 */
