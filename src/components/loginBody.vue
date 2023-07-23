<template>
<div id="top" class="noselect">
  <h2>{{display.heading}}</h2>
  <div v-if="(!env.show_spinner) && (env.config.accepting) && env.current_page == 'login'">
    <input placeholder="Enter a codeword" @keydown.enter="validateCodeword()" id="input_codeword" ref="input_codeword"> <br />
  </div>
  <p>{{display.waiting}}</p>
  <button class="greenButton" @click="validateCodeword()" v-if="!env.show_spinner && env.config.accepting && env.current_page == 'login'">
    Enter
  </button>
  <div class="lds-grid" v-if="(env.show_spinner || env.current_page != 'login') && loader == 0"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-facebook" v-if="(env.show_spinner || env.current_page != 'login') && loader == 1"><div></div><div></div><div></div></div>
  <div class="lds-dual-ring" v-if="(env.show_spinner || env.current_page != 'login') && loader == 2"></div>
  <div class="lds-circle" v-if="(env.show_spinner || env.current_page != 'login') && loader == 3"><div></div></div>
  <div class="lds-throbbing" v-if="(env.show_spinner || env.current_page != 'login') && loader == 4"></div>
  <div class="lds-ring" v-if="(env.show_spinner || env.current_page != 'login') && loader == 5"><div></div><div></div><div></div><div></div></div>
  <div class="lds-roller" v-if="(env.show_spinner || env.current_page != 'login') && loader == 6"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-default" v-if="(env.show_spinner || env.current_page != 'login') && loader == 7"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-ellipsis" v-if="(env.show_spinner || env.current_page != 'login') && loader == 8"><div></div><div></div><div></div><div></div></div>
  <div class="lds-hourglass" v-if="(env.show_spinner || env.current_page != 'login') && loader == 9"></div>
  <div class="lds-ripple" v-if="(env.show_spinner || env.current_page != 'login') && loader == 10"><div></div><div></div></div>
  <div class="lds-spinner" v-if="(env.show_spinner || env.current_page != 'login') && loader == 11"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <p id="warning" style="padding: 10px 0 0 0;" v-if="env.warning.trim().length > 0">{{env.warning}}</p>

  <br />

  <button id="authDiv" @click="signInWithGoogle" v-if="!env.user.auth && env.current_page == 'login'">
    <span>
      <img src="@/assets/google_buttn.svg" alt="G">
    </span>
    <span class="authText">Sign in with Google</span>
  </button>

  <span class="loader noselect" v-if="env.user.auth && env.user.user_placeholder == '' && env.current_page == 'login' && !env.show_spinner">
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
    <span class="loader-box"></span>
  </span>

</div>
</template>

<script>
import {auth, fetchCandidatesList} from "@/firebaseInit";
import {GoogleAuthProvider, signInWithPopup} from "firebase/auth";

const provider = new GoogleAuthProvider();

export default {
  name: "loginBody",
  created: function() {
  },
  // mounted: function() {},
  props: [
    "display"
  ],
  data: function() {
    return {
      loader: -1,
    }
  },
  computed: {
    env: function() {
      return this.$store.state.env;
    }
  },
  mounted: function() {
    this.loader = Math.floor(Math.random()*12);
    if (this.env.config.accepting && this.env.current_page == "login") {
      this.$refs.input_codeword.focus();
    }
  },
  methods: {
    signInWithGoogle: function() {
      signInWithPopup(auth, provider).catch(() => {
        this.$store.dispatch("update_all", {env: {
          warning: "!! Failed to sign-in",
        }});
      });
    },
    validateCodeword: function() {
      const entered_codeword = this.$refs.input_codeword.value.toLowerCase().trim();
      if (entered_codeword == "" || entered_codeword.includes(" ")) {
        this.$store.dispatch("update_all", {env: {
          warning: "!! Bad codeword",
          show_spinner: false,
        }});
        this.loader = Math.floor(Math.random()*12);
      } else {
        this.$store.dispatch("update_all", {env: {warning: "", show_spinner: true}});
        fetchCandidatesList([entered_codeword]).then((res) => {
          if (res.data.msg == "success") {
            const payload = {
              codeword: entered_codeword,
              candidates: res.data.people,
              vote: Array(this.env.config.rankNumCandidates).fill("  "),
              hash: res.data.hash
            };
            this.$store.dispatch("update_ballot", payload).then(() => {
              this.$router.push({path:"/vote", query:{ballot: this.env.ballot.hash}});
            });
          } else {
            this.$store.dispatch("update_all", {env: {
              show_spinner: false,
              warning: res.data.msg
            }}).then(() => {
              this.$refs.input_codeword.value = entered_codeword;
              this.$refs.input_codeword.focus();
            });
            this.loader = Math.floor(Math.random()*12);
          }
        }).catch(() => {
          this.$store.dispatch("update_all", {env: {
            show_spinner: false,
            warning: "!! Network or system error"
          }}).then(() => {
            this.$refs.input_codeword.value = entered_codeword;
            this.$refs.input_codeword.focus();
          });
          this.loader = Math.floor(Math.random()*12);
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

button.greenButton {
  background-color: #1e811e;
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
button.greenButton:hover {
  background-color: snow;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px #1e811e;
}
button.greenButton:active{
  background-color: #1e811e10;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px #1e811e;
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

#authDiv{
  padding: 5px 10px;
  background-color:#fff;
  cursor: pointer;
  border: none;
  font-weight: bold;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14),0 3px 1px -2px rgba(0,0,0,.2),0 1px 5px 0 rgba(0,0,0,.12);
  margin: 8px 0px;
}
#authDiv:hover{
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.14),0 3px 2px -2px rgba(0,0,0,.2),0 1px 10px 0 rgba(0,0,0,.12);
}
#authDiv>span>img{
  display: inline-block;
  height: 18px;
  vertical-align: middle;
  padding: 5px 10px 5px 0px;
}
#authDiv>.authText{
  color: #757575;
  vertical-align: middle;
}

</style>