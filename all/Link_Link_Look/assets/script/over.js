// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        tipNode:cc.Label,
        btn:cc.Node,
        lbScore:cc.Label,
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:
    initOver(isWiner,myScore,otherScore){
        if(isWiner){
            this.tipNode.string = "YOU WIN";
        }else{
            this.tipNode.string = "YOU LOST";
        }
        this.lbScore.string = "" + myScore +" : " + otherScore;
    },
    // onLoad () {},
    startAgent(){
        cc.director.loadScene("begin");
    },
    start () {
        
    },

    // update (dt) {},
});
