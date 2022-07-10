// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        linkBox:cc.Node,
        lbTimeLast:cc.Label,
        timeBar:cc.Node,
        player1:cc.Label,
        player2:cc.Label,
        turnMsg:cc.Label,
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

    // onLoad () {},
    tempBlocklist(){
        for(let i=1;i<=64;i++){
            this.blockList.push(i);
        }
    },
    changeTurn(playerId){//bug  有时候会回合结束了还是他的回合！！
        this.nowPlayerId = playerId;
        this.lasttime = 10;
        this.timeBarItem = this.timeBar.getChildByName("bar");
        this.timeBarItem.width = 400;
        
        if(this.playId == playerId){
            this.banner ++;
            console.log("我的回合：抽卡！！");
            this.turnMsg.string = "我的回合";
        }else{
            this.banner --;
            console.log("对手回合：挨打！！");
            this.turnMsg.string = "对手回合";
        }
        if(this.banner >= 2 || this.banner <= -2){
            //this.banner = 0;
            window.app.send(JSON.stringify({
                key:"changTurn",
            }));
            this.banner = 0;
        }
    },
    initGame(playId,playName,otherId,otherName,blockList,nowTurn){

        //map初始化
        this.map = {};
        for(let i=0;i<=9;i++){
            for(let j=0;j<=9;j++){
                this.map[i*10+j] = 0;
            }
        }
        console.log(this.map);
        //
        console.log("自己 "+playId + "  " + playName);
        console.log("别人 "+otherId + "  " + otherName);
        console.log(blockList);
        // this.blockList = [];
        this.blockList = blockList;
        this.playId = playId;
        this.playName = playName;
        this.otherId = otherId;
        this.otherName = otherName;
        this.player1.string = "玩家"+this.playId+"  "+this.playName;
        this.player2.string = "玩家"+this.otherId+"  "+this.otherName;

        this.banner = 0;
        this.changeTurn(nowTurn);
        this.nowPlayerId = nowTurn;
        if(this.playId == 0){
            this.turnMsg.string = "我的回合";
        }else{
            this.turnMsg.string = "对手回合";
        }
    },
    dfs(nowPos,targetPos,ori,port){//当前位置  目标位置  当前方向（0下，1上，2右，3左） 经过的转折数
        if(nowPos == targetPos && port <= 2){
            return port;
        }
        if(port > 2){//转折超过2
            return port;
        }
        
        let tport = 4;
        for(let i=0;i<4;i++){
            let nextPos = nowPos + this.dir[i];
            if(!this.vis[nextPos] && nextPos >= 0 && nextPos<=99 && (this.map[nextPos] == 0 || nextPos == targetPos)){//下个点没走过  下个点可以走(空地 目标点)
                this.vis[nextPos] = true;
                if(ori == i){//相同方向
                    tport = Math.min(tport,this.dfs(nextPos,targetPos,i,port));
                }else{//不同方向
                    tport = Math.min(tport,this.dfs(nextPos,targetPos,i,port+1));
                }
                this.vis[nextPos] = false;
            }
        }
        return tport;
    },
    syncLink(onePos,twoPos){
        this.map[onePos].destroy();
        this.map[twoPos].destroy();
        this.map[onePos] = 0;
        this.map[twoPos] = 0;
    },
    link(lastPos,thisPos){//是可以消除的位置才进来 lastPos  thisPos 位置是可以消除的
        if(this.playId != this.nowPlayerId)
            return;
        // if(this.map[lastPos].num > 32 && this.playId == 0)//玩家0 点击了绿色块 不能操作
        //     return;
        // if(this.map[lastPos].num <= 32 && this.playId == 1)//玩家1 点击了蓝色块 不能操作
        //     return;
        if(this.map[lastPos].num <= 32  && this.playId != 1) return ;//console.log("只有玩家1才能点击了绿色块");
        if(this.map[lastPos].num > 32 && this.playId != 0) return ;//console.log("只有玩家0才能点击了蓝色块");
        console.log("执行消除");
        this.vis[lastPos] = true;
        let reslut = this.dfs(lastPos,thisPos,-1,-1);//判断是否有路径可以消除
        if(reslut <= 2){
            console.log("消除完成");
            // this.map[key].destroy();
            // this.lasttime += 5;//同步时间没想到办法 不弄了
            // this.timeBarItem.width += 200;
            this.map[lastPos].destroy();
            this.map[thisPos].destroy();
            this.map[lastPos]= 0;
            this.map[thisPos]= 0;
            //1 - 16 用玩家信息存

            //更新同步  更新时间  更新对手的方块 更新胜利条件 ？？？
            window.app.send(JSON.stringify({
                key:"syncLink",
                ablePlay:this.otherId,
                onePos:lastPos,
                twoPos:thisPos,
            }));
            //得分
            window.app.send(JSON.stringify({
                key:"addScore",
                idx:this.playId,
            }));
        }
        this.vis[lastPos] = false;
        
        
        //this.checkover();
    },
    doCreatBlock(blockList){
        for(let i=1;i<=8;i++){//行 
            for(let j=1;j<=8;j++){//列
                let newBlock = cc.instantiate(this.blockItem);
                this.linkBox.addChild(newBlock);
                newBlock.x = -497.5 + (j-1)*(17 + 125);
                newBlock.y = 367.5 - (i-1)*(10 + 95);
                let tempnumber = blockList.shift();// 1 17 33 49 同一组 %16 余数相同同组 /16 < 2同色
                newBlock.num = tempnumber;
                //console.log(tempnumber);

                tempnumber %= 16;//分组  
                if(!tempnumber) tempnumber = 16;
                if(newBlock.num/16 <= 2 ){//分组的基础上分色
                    newBlock.color = cc.color(0,255,0);
                }
                let lbNumber = newBlock.getChildByName("number").getComponent(cc.Label);
                lbNumber.string = tempnumber;
                let pos =  i*10 + j;
                newBlock.pos = pos;
                this.map[pos] = newBlock;

                newBlock.on(cc.Node.EventType.TOUCH_START,()=>{
                    
                    // console.log(newBlock.num);
                    // console.log("点击位置："+newBlock.pos);
                    // //this.nowClickPos = newBlock.pos;
                    // console.log("已点击位置："+this.nowClickPos);
                    if(!this.nowClickPos){//没有点击的数字
                        this.nowClickPos = newBlock.pos;
                        newBlock.runAction(cc.scaleTo(0.2,1.2));
                    }else if(this.nowClickPos == newBlock.pos){//有点击的数字  并且当前数字放大了 变回去
                        this.nowClickPos = 0;
                        newBlock.runAction(cc.scaleTo(0.2,1));
                    }else{////有点击的数字  并且当前不是已点击数字 执行消除
                        newBlock.runAction(cc.sequence(
                            newBlock.runAction(cc.scaleTo(0.2,1.2)),
                            newBlock.runAction(cc.scaleTo(0.2,1)),
                            cc.callFunc(()=>{
                                this.map[this.nowClickPos].runAction(cc.scaleTo(0.2,1));
                                let num1 = this.map[this.nowClickPos].num;
                                let num2 = newBlock.num;
                                console.log("num1 "+num1);
                                console.log("num2 "+num2);
                                if(num1%16 == num2%16){//同组
                                    console.log("num1%16 "+num1%16);
                                    console.log("num2%16 "+num2%16);
                                    let f1 = (num1/16 <= 2 ? true:false);
                                    let f2 = (num2/16 <= 2 ? true:false);
                                    if(f1 == f2){
                                        console.log("符合条件");
                                        this.link(this.nowClickPos,newBlock.pos);
                                    }else{
                                        console.log("不符合条件");
                                    }
                                }
                                this.nowClickPos = 0;
                            })
                        ));
                    }
                })
            }
        }
    },
    start () {
        this.lasttime = 10;
        this.timeHolder = 0;
        this.dir =[10,-10,1,-1];// 方向 下  上  右  左
        this.vis = [];//经历过
        this.blockItem = this.linkBox.getChildByName("tblock");
        this.nowClickPos = 0;//点击过的数字位置
        

        //this.tempBlocklist();
        this.doCreatBlock(this.blockList);//同步构建地图 ？？？
        
        //监听
        window.app.onmessage = (event) =>{
            let data = JSON.parse(event.data);
            //console.log(data.key);
            if(data.key == "changeTurn"){
                console.log("收到回合");
                this.changeTurn(data.playId);
            }else if(data.key == "syncLink"){
                console.log("收到同步");
                console.log(data.onePos,data.twoPos);
                this.syncLink(data.onePos,data.twoPos);
            }else if(data.key == "gameOver"){
                console.log("gameOver ：" + data.winner);
                let isWiner = false;
                let myScore,otherScore;
                if(data.winner == this.playId) isWiner = true;
                if(this.playId == 0){
                    myScore = data.score0;
                    otherScore = data.score1;
                }else{
                    myScore = data.score1;
                    otherScore = data.score0;
                }
                cc.director.loadScene("over",()=>{
                    let scGame = cc.find("Canvas/over").getComponent("over");
                    scGame.initOver(isWiner,myScore,otherScore);
                })
            }
           
        }
    },

    update (dt) {
        this.lasttime -= dt;
        this.timeHolder += dt;
        if(this.timeHolder >= 0.1 && this.lasttime > 0){
            this.timeHolder = 0;
            this.timeBarItem.width -= 4;
        }
        if(this.lasttime <=0){
            //console.log(this.cishu);
            this.lasttime = 0;
            this.timeBarItem.width = 0;
        }
        if(this.lasttime >=10){
            //console.log(this.cishu);
            this.lasttime = 10;
            this.timeBarItem.width = 400;
        }
        this.lbTimeLast.string = ":"+Math.ceil(this.lasttime);
                
    },
});
