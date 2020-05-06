<template>
<div id="top">
  <span><b>Home</b> <span v-if="user_login_config.adminAuth"> | <u class="link" @click="go_to_admin()">Admin</u></span> | <u class="link" @click="go_to_about()">About</u></span>
  <br /><br />
  <h2>Enter With Codeword</h2>
  <div v-if="(!user_login_config.show_spinner) && (backConfig.accepting)">
    <input placeholder="Enter a codeword" @keydown.enter="validateCodeword()" ref="input_codeword"> <br />
  </div>
  <p v-if="!backConfig.accepting">Responses are not currently being accepted</p>
  <button @click="validateCodeword()" v-if="(!user_login_config.show_spinner) && (backConfig.accepting)">Enter with codeword</button>
  <div class="lds-spinner" v-if="user_login_config.show_spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> <br />
  <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />
  <div id="firebaseui-auth-container"> </div>
  <p id="warning">{{warning}}</p>
  <p id="footer">v0.32.0rc5</p>
</div>
</template>

<script>
import {db} from "../App.vue"
import {functions} from "../App.vue"
import {uiConfig} from "../App.vue";
import {ui} from "../App.vue";
import {firebase_auth_instance} from "../App.vue";

export default {
  name: "BodyUserLogin",
  props: [],
  created: function(){
    db.ref("/config").once("value").then((snap) => {
      this.backConfig = snap.val();
      this.$emit("configFetched", snap.val());
      this.user_login_config.show_spinner = false;
      this.$nextTick(() => {
        this.$refs.input_codeword.focus();
      });
    });
    firebase_auth_instance.onAuthStateChanged((user) => {
      if (user){
        const validateUser = functions.httpsCallable("validateUser");
        validateUser({});
        db.ref(`/users/${user.uid}`).once("value").then((snap) => {
          this.user_login_config.adminAuth = snap.val();
        }).then(() => {
          this.$emit("UserInfoFetch", [user, true]);
        }).catch(() => {
          this.$emit("UserInfoFetch", [user, false]);
        });
      } else{
        ui.start("#firebaseui-auth-container", uiConfig);
      }
    });
  },
  mounted: function(){},
  data: function(){
    return {
      user_login_config: {
        show_spinner: true,
        accepting: false,
        adminAuth: false
      },
      backConfig: {
        accepting: false
      },
      warning: " "
    }
  },
  methods: {
    go_to_about: function(){
      window.location.href = "/about/";
    },
    validateCodeword: function(){
      this.user_login_config.show_spinner = true;
      const entered_codeword = this.$refs.input_codeword.value.toLowerCase().trim();
      if (entered_codeword == ""){
        this.warning = "!! Bad codeword";
        this.user_login_config.show_spinner = false;
      } else{
        fetch("/fetchCandidatesList", {
          method: "POST",
          body: JSON.stringify([entered_codeword])
        }).then((response) => {
          response.json().then((data) => {
            if (data.message === "success"){
              this.backConfig.codeword = entered_codeword;
              this.backConfig.candidates = data.people;
              this.toVote();
              this.user_login_config.show_spinner = false;
            } else{
              this.warning = data.errMsg;
              this.user_login_config.show_spinner = false;
              this.$nextTick(() => {
              this.$refs.input_codeword.focus();
              });
            }
          }).catch(() => {
            this.warning = "!! Network or system error";
            this.user_login_config.show_spinner = false;
            this.$nextTick(() => {
              this.$refs.input_codeword.focus();
            });
          });
        });
      }
    },
    toVote: function(){
      const payload = {
        config: this.backConfig,
      }
      this.$emit("CandidatesRetrieved", payload);
    },
    go_to_admin: function(){
      this.$emit("GotoAdmin");
    }
  }
}
</script>

<style scoped>
#top {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  width: 25%;
  max-width: 540px;
  min-width: 250px;
  margin: 20px auto;
  border: 1pt solid;
  padding: 20px 10px 15px 20px;
  background-color: whitesmoke;
}
#footer{
  color:black;
  position: relative;
  bottom:5px;
  width:98%;
  padding-top: 10%;
  text-align:left;
}
button {
  background-color: #2eb82e;
  color: white;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  max-width: 220px;
  margin-bottom: 5px;
  height: auto;
  min-height: 40px;
  font-weight: bold;
  box-shadow: 1px 1px 2px #999;
}
button:hover {
  opacity: 0.9;
  box-shadow: 0px 0px 3px #666;
}
button:active{
  opacity: 1;
  box-shadow: 0px 0px 1px #666;
}
input{
  text-align: center;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: none;
  outline: none;
  border-bottom: 2px solid olivedrab;
  background-color: whitesmoke;
}
input:focus{
  background-color: white;
  box-shadow: 0 0 4px white;
}
</style>