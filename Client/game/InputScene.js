class InputScene extends tt.Node{

    uiFrame;
    uiTitle;
    uiInput;

    inputCallback;
    constructor(){
        super();
        this.uiFrame = new tt.Sprite("optionUI.png");
        this.uiFrame.setPosition([-256, -256]);
        this.addChild( this.uiFrame);

        this.uiTitle = new tt.Label("Input Your Name");
        this.uiTitle.setPosition([-200,140]);
        this.addChild( this.uiTitle );

        this.uiInput = new tt.InputField();
        this.uiInput.enable( true );
        this.uiInput.setPosition([-200,0]);
        this.addChild( this.uiInput );


    }

    setInputCallback( callback ){
        this.inputCallback = callback;
        let self = this;


        this.uiInput.setEnterCallback( function(input ){
            if ( input.length !== 0 ){
                self.inputCallback();
            }
        });
    }
}