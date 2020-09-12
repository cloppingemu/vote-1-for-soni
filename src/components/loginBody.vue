<template>
<div id="top">
  <!-- <span><router-link to="/">Home</router-link> <span v-if="env.user.user_is_admin === 1"> | <router-link to="/admin">Admin</router-link></span> | <router-link to="/about">About</router-link></span> -->
  <!-- <br /><br /> -->
  <h2 v-if="env.config.accepting">Enter with Codeword</h2>
  <div v-if="(!env.config.show_login_spinner) && (env.config.accepting)">
    <input placeholder="Enter a codeword" @keydown.enter="validateCodeword()" id="input_codeword" ref="input_codeword"> <br />
  </div>
  <p v-if="!env.config.accepting">Responses are not currently being accepted</p>
  <button @click="validateCodeword()" v-if="(!env.config.show_login_spinner) && (env.config.accepting)">Enter with Codeword</button>
  <div class="lds-grid" v-if="env.config.show_login_spinner && loader == 0"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-facebook" v-if="env.config.show_login_spinner && loader == 1"><div></div><div></div><div></div></div>
  <div class="lds-dual-ring" v-if="env.config.show_login_spinner && loader == 2"></div>
  <div class="lds-circle" v-if="env.config.show_login_spinner && loader == 3"><div></div></div>
  <div class="lds-throbbing" v-if="env.config.show_login_spinner && loader == 4"></div>
  <div class="lds-ring" v-if="env.config.show_login_spinner && loader == 5"><div></div><div></div><div></div><div></div></div>
  <div class="lds-roller" v-if="env.config.show_login_spinner && loader == 6"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-default" v-if="env.config.show_login_spinner && loader == 7"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-ellipsis" v-if="env.config.show_login_spinner && loader == 8"><div></div><div></div><div></div><div></div></div>
  <div class="lds-hourglass" v-if="env.config.show_login_spinner && loader == 9"></div>
  <div class="lds-ripple" v-if="env.config.show_login_spinner && loader == 10"><div></div><div></div></div>
  <div class="lds-spinner" v-if="env.config.show_login_spinner && loader == 11"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/3.5.2/firebaseui.css" />
  <p id="warning" style="padding: 0 0 20px 0;" v-if="env.config.login_warning.trim().length > 0">{{env.config.login_warning}}</p>
  <div id="firebaseui-auth-container"> </div>
</div>
</template>

<script>
import {functions} from "@/App.vue";
// import {uiConfig} from "@/App.vue";
// import {ui} from "@/App.vue";
// import {firebase_auth_instance} from "@/App.vue";

const fetchCandidatesList = functions.httpsCallable("fetchCandidatesList");

export default {
  name: "LoginBody",
  props: [
    "env"
  ],
  created: function(){
    this.loader = Math.floor(Math.random()*12);
  },
  // mounted: function(){},
  data: function(){
    return {
      loader: 0,
    }
  },
  methods: {
    go_to_about: function(){
      window.location.href = "/about/";
    },
    validateCodeword: function(){
      this.$emit("updateEnv", {config: {show_login_spinner: true}});
      const entered_codeword = this.$refs.input_codeword.value.toLowerCase().trim();
      if (entered_codeword == "" || entered_codeword.includes(" ")){
        this.$emit("updateEnv", {config:
          {login_warning: "!! Bad codeword",
          show_login_spinner: false}
        });
        this.loader = Math.floor(Math.random()*12);
      } else{
        this.$emit("updateEnv", {config: {login_warning: " "}});
        fetchCandidatesList([entered_codeword]).then((res) => {
          if (res.data.msg === "success"){
            const update_object = {ballot: {
              codeword: entered_codeword,
              candidates: res.data.people,
              vote: Array(this.env.config.rankNumCandidates).fill("  ")
            }};
            this.$emit("updateEnv", update_object);
            this.$router.push("/vote");
          } else{
            this.$emit("updateEnv", {config: {show_login_spinner: false, login_warning: res.data.errMsg}});
            this.loader = Math.floor(Math.random()*12);
            this.$nextTick(() => {
              this.$refs.input_codeword.value = entered_codeword;
              this.$refs.input_codeword.focus();
            });
          }
        }).catch(() => {
          this.$emit("updateEnv", {config: 
            {show_login_spinner: false,
             login_warning: "!! Network or system error"}
          });
          this.loader = Math.floor(Math.random()*12);
          this.$nextTick(() => {
            this.$refs.input_codeword.value = entered_codeword;
            this.$refs.input_codeword.focus();
          });
        });
      }
    },
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
  margin: 0 auto;
  margin-top: calc(7.5vh + 50px);
  border: 1pt solid;
  padding: 20px 10px 15px 20px;
  background-color: #f7f7f7;
}

button {
  background-color: #269926;
  color: whitesmoke;
  padding: 2px 10px;
  border: none;
  cursor: pointer;
  max-width: 220px;
  margin-top: 20px;
  margin-bottom: 10px;
  height: auto;
  min-height: 40px;
  font-weight: bold;
}
button:hover {
  background-color: snow;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px #269926;
}
button:active{
  background-color: #26992622;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px #269926;
  transition: all 0.01s;
}

input{
  text-align: center;
  padding: 12px 20px;
  margin: 8px 0;
  box-sizing: border-box;
  border: none;
  outline: none;
  border-bottom: 2px solid olivedrab;
  background-color: #f7f7f7;
}
input:focus{
  background-color: white;
  box-shadow: 0 0 4px white;
}
</style>