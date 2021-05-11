var canvas;
var gl;
var ScreenSize = [1920, 1080];

// (function(){
//     getInput("Enter Your Name", function( input ){
//         const socket = io({
//             reconnection : false,
//             auth :{
//                 username : input
//             },
//         });
//         new Socket( socket );
//     }, fastTest );
// })();



function GameMain() {

    //#region 렌더링 변수
    var lastFrameTime = Date.now() / 1000;

    var bgColor = [0, 0.5, 1, 1];



    let currentScene;

    // let uiFrame;
    // let uiTitle;
    // let uiInput;
    //#endregion


    //#region inGame val
    var characters = [];
    var characterID = [ 106011,109631 ,102031,103631, 113431,106131,110531,110931];
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

        tt.FontSystem.initialize( function(){
            TextureUtil.loadTexture(function () {
                // InitCharacter();
                // initInputScene();    
                currentScene = new GameScene( startGame );            
            });}
        );
    }

    function InitCharacter(){
        function loadSpineCharacter( index ){
            if ( index < characters.length  ){
                characters[index].loadCharacter( characterID[index], classID[index] , loadSpineCharacter.bind(null, index+1));
                // characters[index].setVisible(false);
            }
            else {
                startGame();
            }
        }

        for( let i = 0 ; i < characterID.length ; i ++ ){
            // let character = new Spine();
            let character = new tt.Princess();
            characters.push( character );
            character.initialize();
        }
        loadSpineCharacter(0);
    };



    function initInputScene(){
        currentScene = new InputScene();
        currentScene.setInputCallback( function(){
            InitGameScene();
        })
    }

    function InitGameScene(){
        // delete currentScene;
        currentScene = new GameScene();
    }


    function update() {

        var now = Date.now() / 1000;
        var delta = now - lastFrameTime;
        lastFrameTime = now;

        currentScene.update( delta );

        render(delta);
        requestAnimationFrame(update);

    }

    function render(delta) {

        gl.clearColor(bgColor[0], bgColor[1], bgColor[2], 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        resize();

        currentScene.render();

        // characters.forEach(element=>{
        //     element.render(delta, false);
        // });
    }

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


        currentScene.resize(scale);


        gl.viewport(0, 0, canvas.width, canvas.height);
    }


    function startGame() {
        requestAnimationFrame(update);
        // openSequence1();
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
