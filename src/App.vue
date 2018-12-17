<template>
  <div id="app">
    <div class="header">Welcome to Chat!</div>
    <div class="container">
      <div style="display: flex;align-items: center;width: fit-content;height: fit-content">
        Please enter your name:<input class="name-input" @keyup.enter="connectToWS" v-model="name" :disabled="nameInputDisabled"></div>
      <div class="chat-item" v-for="item in chatItems">
        {{item.text}}
      </div>
    </div>
    <div class="chat-input" v-if="nameInputDisabled">
      enter text:<input @keyup.enter="sendChatText" v-model="chatText"/></div>
  </div>
</template>

<script>
  import $ from 'jquery'
export default {
  name: 'App',
  data(){
    return{
      ws:"",
      name:"",
      nameInputDisabled:false,
      chatItems:[],
      chatText:""
    }
  },
  created(){

  },
  mounted(){
    $(".name-input").focus();
  },
  destroyed(){

  },
  methods:{
    connectToWS(){
      if(this.name==""){
        alert("name cannot empty!");
        return;
      }

      if(this.ws==""){
        this.ws = new WebSocket("ws://localhost:8088");

        this.ws.onopen = (evt)=> {
          console.log("Connection open ...");
          this.ws.send(JSON.stringify({type:"enter",sender:this.name}));
        };

        this.ws.onmessage = (evt)=> {
          if(evt.data!=undefined){
            if(!this.nameInputDisabled){
              if(JSON.parse(evt.data).valid==true){
                this.nameInputDisabled=true;
                this.$nextTick(()=>{
                  $(".chat-input").focus();
                });
                let text="[ "+(new Date()).toLocaleTimeString()+" ] "+this.name+" Joined Chat!";
                this.chatItems.push({text:text});
              }else if(JSON.parse(evt.data).valid==false){
                alert("please enter different name!");
              }
            }else if(this.nameInputDisabled){  //nameInputDisabled为true表示已开始聊天
              let data=JSON.parse(evt.data);
              if(data.type=="joined"){
                let text="[ "+(new Date()).toLocaleTimeString()+" ] "+data.sender+" Joined Chat!";
                this.chatItems.push({text:text});
              }else if(data.type=="chat"){
                let text=data.sender+": "+data.chatText;
                this.chatItems.push({text:text});
              }
            }
          }
        };
      }else {
        this.ws.send(JSON.stringify({type:"enter",sender:this.name}));
      }
    },
    sendChatText(){
      this.ws.send(JSON.stringify({type:"chat",sender:this.name,chatText:this.chatText}));
    }
  }
}
</script>

<style>
  *{
    margin: 0;
    padding: 0;
  }
  input{
    border: none;
    background-color: transparent;
    color: lightgrey;
  }
  input:focus{
    border: none;
    outline: none;
  }
  body,html{
    width: 100%;
    height: 100%;
  }
  .header{
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  #app{
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: black;
    color: lightgrey;
    align-items: center;
  }
  .container{
    width: fit-content;
    height: fit-content;
  }
  .name-input{
    margin-left: 1rem;
    color: lightgrey;
    font-size: 1rem;
  }
  .name-input:focus{
    border: none;
    outline: none;
  }

  .chat-item{
    width: fit-content;
    height: fit-content;
    margin-top: 1rem;
  }

  .chat-input{
    position: absolute;
    bottom: 1rem;
    display: flex;
    align-items: center;
  }
  .chat-input input{
    border-bottom: 1px solid lightgrey !important;
    margin-left: 0.5rem;
  }
</style>
