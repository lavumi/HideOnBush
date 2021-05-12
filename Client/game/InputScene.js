class InputScene extends tt.Scene{

    uiFrame;
    uiTitle;
    uiInput;

    inputStage = 0;

    constructor(loadFinishCallback){
        super();
        this.uiFrame = new tt.Sprite("optionUI.png");
        this.uiFrame.setPosition([0, 0]);
        this.addChild( this.uiFrame);

        this.uiTitle = new tt.Label("Input Your Name");
        this.uiTitle.setPosition([-200,140]);
        this.addChild( this.uiTitle );

        this.uiInput = new tt.InputField();
        this.uiInput.enable( true );
        this.uiInput.setPosition([-200,0]);
        this.addChild( this.uiInput );

        if ( typeof loadFinishCallback === "function")
            loadFinishCallback();



        let self = this;
        this.uiInput.setEnterCallback( function(input ){
            if ( input.length !== 0 ){
                self.inputCallback( self.inputStage );
            }
        });
        
    }


    inputCallback ( inputStage ){

        cc.log('InputScene.js(43)' , inputStage, this.uiInput.getString() )
        switch ( inputStage ){
            case 0 : 
                const socket = io({
                    reconnection : false,
                    auth :{
                        username : this.uiInput.getString()
                    },
                });
                new Socket( socket );
                break;
            case 1:

                break;
        }
    }
}