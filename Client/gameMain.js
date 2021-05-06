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
        [-450,150],[-150,150],[150,150],[450,150],
        [-450,-330],[-150,-330],[150,-330],[450,-330]
    ];

    var gamePos = [
        [0,-1000],
        [1700,0],
        [0,600],
        [-1700,0],
        [-300,-330],
        [0,-330],
        [300,-330],
        [0,150]
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


        initInput();
        initFont();

        for( let i = 0 ; i < characterID.length ; i ++ ){
            let character = new Spine();
            characters.push( character );
            character.init();
        }



        function loadSpineCharacter( index ){
            if ( index < characters.length  ){
                characters[index].load( characterID[index], classID[index] , loadSpineCharacter.bind(null, index+1));
            }
            else {
                startGame();
            }
        }

        TextureUtil.loadTexture(function () {
            loadSpineCharacter(0);
        })


    }

    function initInput() {
        keyMap = {};
        document.addEventListener('keydown', function (event) {
            return;


            if (keyMap[event.code] === true) return;

            // if(event.code === 'ArrowRight' ){
            //     runChar( false);
            // }
            // else if (event.code === 'ArrowLeft'){
            //     runChar( true);
            // }
            if (event.code === 'KeyA') {
                //sendScore(score);

            }
            // else if (event.code === 'KeyS'){
            //     attack2Char();
            // }

            // else if (event.code === 'KeyQ'){
            //     dieChar( );
            // }
            // else if (event.code === 'KeyW'){
            //     damageedChar();
            // }

            // else if (event.code === 'KeyZ'){
            //     useSkill( 0);
            // }
            // else if (event.code === 'KeyX'){
            //     useSkill( 1);
            // }
            // else if (event.code === 'KeyC'){
            //     useSkill( 2);
            // }

            if (event.code === 'Space') {
                event.preventDefault();

            }

            keyMap[event.code] = true;

        }, false);

        document.addEventListener('keyup', function (event) {
            keyMap[event.code] = false;

        }, false);
    }

    function initFont(){
        FontSystem.loadFont();
        // FontSystem.setString("score", "Score : " + 0);
        // FontSystem.setPosition("score", [0, 470]);

    }

    function getAlpabetFromInput(input) {
        if (input.indexOf('Key') !== -1) {
            return input.replace('Key', "");
        }
        else {
            return null;
        }
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


        // SpriteShader.bind();
        // SpriteShader.setTexture("bg.png");
        // for (var i = 0; i < 4; i++) {
        //     SpriteShader.setAttr(farBgPos[i]);
        //     SpriteShader.draw();
        // }

        // SpriteShader.setTexture("ground2.png");
        // for (var i = 0; i < 6; i++) {
        //     SpriteShader.setAttr(nearBgPos[i], 0.5);
        //     SpriteShader.draw();
        // }

        // SpriteShader.setTexture("tree.png");
        // for (var i = 0; i < 6; i++) {
        //     SpriteShader.setAttr(nearBgPos[i]);
        //     SpriteShader.draw();
        // }

        // SpriteShader.setTexture("obstacle.png");
        // for (var i = 0; i < obstaclePos.length; i++) {
        //     SpriteShader.setAttr(obstaclePos[i]);
        //     SpriteShader.draw();
        // }

        FontSystem.draw();

        characters.forEach(element=>{
            element.render(delta, false);
        })
    }

    function drawUI() {

        SpriteShader.setTexture("optionUI.png");
        SpriteShader.setAttr([-256, -256]);
        SpriteShader.draw();

        FontSystem.setVisible("Ranktxt", true);
        FontSystem.setVisible("MyNAME", true);
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

        openSequence1();
        requestAnimationFrame(update);
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
            console.log("---", rnd);
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
        characters[0].setDearIdle();
        characters[1].setDearIdle(-1);
        characters[2].setDearIdle(-1);
        characters[3].setDearIdle();
        characters[4].setIdle();
        characters[5].setIdle();
        characters[6].setIdle();
        characters[7].die();

        //커튼 젖히기


        setTimeout( openSequence5 , 1000);

    }
    function openSequence5(){


        //메인 게임 시작
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

