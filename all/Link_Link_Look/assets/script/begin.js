// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
       lbEditBox:cc.Node,
       effectNode:cc.Node,
       tipsNode:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},
    
    startGame(){
        
        if(this.editItem.string == "")
        {
            console.log("输入名称才能开始游戏哦");
        }else{
            //console.log(this.editItem.string);
            this.name = this.editItem.string;
            this.effectNode.active = !this.effectNode.active;
            this.tipsNode.active = !this.tipsNode.active;
            if(this.effectNode.active){
                window.app.send(JSON.stringify({
                    key:"startMatch",
                    name:this.name,
                }));
            }else{
                window.app.send(JSON.stringify({
                    key:"stopMatch",
                    name:this.name,
                }));
            }
        }
        
    },

    start () {
        this.editItem = this.lbEditBox.getComponent(cc.EditBox);
        //effectNode.runAction();
        window.app = new WebSocket("ws://localhost:9069/aoge");
        window.app.onmessage = (event) =>{
            let data = JSON.parse(event.data);
            //console.log(data);
            if(data.key == "gameStart"){
                console.log("玩家"+data.playId+data.playName+"开始游戏");
                console.log(data.blockList);
                cc.director.loadScene("game",()=>{
                    let scGame = cc.find("Canvas/game").getComponent("game");
                    scGame.initGame(data.playId,data.playName,data.otherId,data.otherName,data.blockList,data.nowTurn);
                });
            }

        }
    },

    // update (dt) {},
});
