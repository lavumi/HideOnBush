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

    var characters = [];
    //#endregion


    //#region inGame val
    var characterID = [106011,109631 ,102031,103631, 113431,106131,110531,110931];
    var classID = [7,2,5,7,29,5,2,2];

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
                initGame();
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

    function initGame() {
        // characters.forEach( element =>{
        //     element.setIdle();
        // })

        let length = characters.length;

        // for( let i = 0 ; i < length  ; i ++ ){
        //     let pos = i  - Math.floor(length /2 ) ;
        //     characters[i].setPosition( pos *  300 , 0);
        // }

        characters[0].setPosition(0,-1000);
        characters[1].setPosition(0,600);
        characters[2].setPosition(-1700,0);
        characters[3].setPosition(1700,0);
        characters[4].setPosition(-300,-330);
        characters[5].setPosition(0,-330);
        characters[6].setPosition(300,-330);
        characters[7].setPosition(0,150);
        




        characters[0].setDearIdle();
        characters[1].setDearIdle(-1);
        characters[2].setDearIdle();
        characters[3].setDearIdle(-1);
        characters[4].setIdle();
        characters[5].setIdle();
        characters[6].setIdle();
        characters[7].die();

        requestAnimationFrame(update);



    }

    function update() {

        var now = Date.now() / 1000;
        var delta = now - lastFrameTime;
        lastFrameTime = now;
        // console.log(delta);
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

    return {
        init: init
    }
    //endregion
}

var main = new GameMain();
main.init();


