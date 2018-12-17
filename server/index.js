const WebSocket = require('ws');
const redis=require("redis");
const wss = new WebSocket.Server({
  port: 8088,
});

wss.on('connection', (ws)=> {
  ws.on('message', (message)=> {
    let m=JSON.parse(message);
    if(m.type!=undefined&&m.sender!=undefined){
      switch (m.type){
        case "enter":
          wsEnter(ws,m.sender);
          break;
        case "chat":
          wsChat(ws,m.sender,m.chatText);
          break;
      }
    }
  });
  ws.on('close',()=>{
    if(ws.name!=undefined){
      wsClientClosed(ws.name);         //从chat users里面删除用户
    }
  });
});

function wsEnter(ws,username) {
  let mClient=redis.createClient();
  mClient.smembers("chat users",(err,replies)=>{
    if(err) throw err;
    for(let i=0;i<replies.length;i++){
      if(username==replies[i]){
        ws.send(JSON.stringify({valid:false}));
        mClient.quit();
        return;
      }
    }

    mClient.sadd("chat users",username);
    ws.name=username;
    ws.send(JSON.stringify({valid:true}));
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({type:"joined",sender:ws.name}));
      }
    });
    mClient.quit();
  });
}

function wsChat(ws,username,chatText) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({type:"chat",sender:ws.name,chatText:chatText}));
    }
  });
}

function wsClientClosed(username) {
  let mClient=redis.createClient();
  mClient.SREM("chat users",username);
  mClient.quit();
}



