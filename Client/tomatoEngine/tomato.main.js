let tt = {};
let cc = console;
tt.gameEngine = class LavumiZZANG {
    static #_instance = null;




    currentScene = null;
    gl = null;


    lastFrameTime = Date.now() / 1000;
    bgColor = [0, 0.5, 1, 1];
    screenSize = [1920, 1080];


    constructor(){

    }

    static getInstance(){
        if (this.#_instance === null  ){
            this.#_instance = new LavumiZZANG();
        }
        return this.#_instance;
    }

    Initialize( initFinishCallback ){

        let canvas = document.getElementById("canvas");
        let config = { alpha: false };
        this.gl = canvas.getContext("webgl", config) || canvas.getContext("experimental-webgl", config);
        if (!this.gl) {
            alert('WebGL is unavailable.');
            return;
        }


        let self = this;
        tt.InputManager.Initialize();
        tt.FontRenderer = new FontRenderer();
        tt.FontRenderer.initialize( function(){
            TextureUtil.loadTexture(initFinishCallback);
        });

    }

    getScreenSize(){
        return this.screenSize;
    }

    setScene( scene ){
        // console.log('tomato.main.js(52)' , scene );
        this.currentScene = scene;
    }

    startEngine(){
        requestAnimationFrame( this.update.bind(this));
    }

    update(){
        var now = Date.now() / 1000;
        var delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        
        // cc.log('tomato.main.js(66)' , this.currentScene );
        this.currentScene.update(delta);
        requestAnimationFrame(this.update.bind(this));


        this.render();
    }


    render(){
        this.gl.clearColor(this.bgColor[0], this.bgColor[1], this.bgColor[2], 1);
        this.gl.clear(gl.COLOR_BUFFER_BIT);
        this._resize();

        this.currentScene.render();
    }


    _resize(){
        var w = this.screenSize[0];
        var h = this.screenSize[1];

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

        this.currentScene.resize(scale);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
}