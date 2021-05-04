import Socket from "./client.js";


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