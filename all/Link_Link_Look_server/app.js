const { json } = require("express");
let express = require("express");
let express_ws = require("express-ws");
let app = express();
express_ws(app);

let roomId = 1000;
let roomList = {};//房间列表 通过id能拿到房间的信息
let matchList = [];//匹配列表   内有玩家信息
this.nowTurn = 0;
let blockList = [];
app.ws("/aoge",(ws,res)=>{
    console.log("有人链接了");
    ws.on("message",(data)=>{
        data = JSON.parse(data);
        if(data.key == "startMatch"){
            console.log("有人匹配了");
            console.log("玩家:"+data.name);
            ws.name = data.name;
            matchList.push(ws);
            console.log("匹配人数  "+matchList.length);
            if(matchList.length >= 2){
                
                let ws1 = matchList.pop();
                let ws2 = matchList.pop();
                ws1.playId = 0;
                ws2.playId = 1;
                ws1.roomId = roomId;
                ws2.roomId = roomId;
                let room = roomList[roomId] ={
                    playerList:[ws1,ws2],
                    score:[0,0],
                }
                
                blockList = [];
                doCreatBlockList();
                // for(let i=0;i<=63;i++){
                //     console.log(blockList[i]);
                // }
                this.nowTurn = 0;
                console.log("最开始"+this.nowTurn);
                ws1.send(JSON.stringify({
                    key:"gameStart",
                    playId:ws1.playId,
                    playName:ws1.name,
                    otherId:ws2.playId,
                    otherName:ws2.name,
                    blockList:blockList,
                    nowTurn:0,
                }));
                ws2.send(JSON.stringify({
                    key:"gameStart",
                    playId:ws2.playId,
                    playName:ws2.name,
                    otherId:ws1.playId,
                    otherName:ws1.name,
                    blockList:blockList,
                    nowTurn:0,
                }));
                //初始化地图
                

                //初始化行动回合  玩家1先动
                // ws1.send(JSON.stringify({
                //     key:"changeTurn",
                //     playId:this.nowTurn,
                // }));
                // ws2.send(JSON.stringify({
                //     key:"changeTurn",
                //     playId:this.nowTurn,
                // }));
                
                

                //dosetOuttime 切换回合
                setTimeout(()=>{
                    doChangTurn(room,1);
                },10*1000)
            }
            
        }else if(data.key == "stopMatch"){
            matchList.pop();
            console.log("有人停止匹配了");
            console.log("玩家:"+data.name);
            console.log("匹配人数  "+matchList.length);
        }else if(data.key == "syncLink"){
            for(let tws of roomList[ws.roomId].playerList){
                if(tws != ws){
                    tws.send(JSON.stringify({
                        key:"syncLink",
                        onePos:data.onePos,
                        twoPos:data.twoPos,
                    }));
                }
            }
        }else if(data.key == "addScore"){
            roomList[ws.roomId].score[data.idx] ++;
            if(roomList[ws.roomId].score[data.idx] >= 2){
                for(let tws of roomList[ws.roomId].playerList){
                    tws.send(JSON.stringify({
                        key:"gameOver",
                        winner:data.idx,
                        score0:roomList[ws.roomId].score[0],
                        score1:roomList[ws.roomId].score[1],
                    }));
                }
            }
        }
        // else if(data.key == "changTurn"){
        //     let room = roomList[ws.roomId];
        //     this.nowTurn = this.nowTurn ^ 1;
        //     for(let tws of room.playerList){
        //         tws.send(JSON.stringify({
        //             key:"changeTurn",
        //             playId:this.nowTurn,
        //         }))
        //     }
        // }
    })
})

function doChangTurn(room,idx){//有时多次调用这个 不自变 通过参数来变
    this.nowTurn = idx%2;
    //this.nowTurn = this.nowTurn ^ 1;//回合变更 自变
    console.log("变后："+this.nowTurn);
    // console.log(this.nowTurn);
    for(let tws of room.playerList){
        tws.send(JSON.stringify({
            key:"changeTurn",
            playId:this.nowTurn,
        }))
    }
    setTimeout(() => {
        doChangTurn(room,idx+1);
    }, 10*1000);
}

function doCreatBlockList(){
    for(let i=0;i<=63;i++){
        blockList.push(i+1);
        //console.log(this.blockList[i]);
    }
    for(let i=0;i<=63;i++){
        let radIdx = Math.floor(Math.random()*64);
        let temp = blockList[i];
        blockList[i] = blockList[radIdx];
        blockList[radIdx] = temp;
    }
    for(let i=0;i<=63;i++){
        console.log(blockList[i]);
    }
    console.log("__________________________________")
   
}
console.log("开启服务器");
express
app.listen(9069);//端口