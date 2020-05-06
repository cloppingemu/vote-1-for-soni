<template>
  <div id="app">
    <Header :head_config="head_config" :current_page="current_page" @FirebaseDeauth="firebase_sign_out()" @GotoHome="change_page_to_home()" @GotoAdmin="change_page_to_admin()" v-if="current_page != 'add_vote'"></Header>
    <BodyUserLogin @CandidatesRetrieved="page_to_vote($event)" @GotoAdmin="change_page_to_admin()" @UserInfoFetch="fetched_user_info($event)" v-if="current_page == 'login'" @configFetched="config_fetched($event)"></BodyUserLogin>
    <BodyVote @AddingCandidate="page_to_add_vote($event)" @DeletingVote="delete_vote_from_ballot($event)" @SwapRanks="swap_ranks_on_ballot($event)" :back_config="db_config" :vote_config="vote_config" v-if="current_page == 'vote'"></BodyVote>
    <BodyAdminHome v-if="current_page == 'admin'" @BaseConfigUpdated="config_fetched($event)" :admin_config="admin_config" @FirebaseDeauth="firebase_sign_out()"></BodyAdminHome>
    <AddVote @ReturnToVote="page_return_to_vote($event)" :candidates="db_config.candidates" v-if="current_page == 'add_vote'"></AddVote>
    <!-- <p id="footer">v0.31.13rc3</p> -->
  </div>
</template>

<script>
const firebase = require("firebase/app");
require("firebase/database");
require('firebase/functions');

import {firebaseConfig} from "./firebaseConfig"

firebase.initializeApp(firebaseConfig);
export const functions = firebase.functions()
export const db = firebase.database()

require("firebase/auth");
const firebaseui = require("firebaseui");
export const uiConfig = {
  // signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
  // Leave the lines as is for the providers you want to offer your users.
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  // firebase.auth.GithubAuthProvider.PROVIDER_ID,
  // firebase.auth.EmailAuthProvider.PROVIDER_ID,
  // firebase.auth.PhoneAuthProvider.PROVIDER_ID,
  // firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  // tosUrl and privacyPolicyUrl accept either url string or a callback function.
  // Terms of service url/callback.
  // tosUrl: '<your-tos-url>',
  // Privacy policy url/callback.
  // privacyPolicyUrl: function() {
  //   window.location.assign('<your-privacy-policy-url>');
  // }
  signInSuccessUrl: ".",
};
// Initialize the FirebaseUI Widget using Firebase.
export const ui = new firebaseui.auth.AuthUI(firebase.auth());
export const firebase_auth_instance = firebase.auth();

const Header = require("./components/Header.vue").default;
const BodyUserLogin = require("./components/UserLogin.vue").default;
const AddVote = require("./components/AddVote.vue").default;
const BodyVote = require("./components/Vote.vue").default;
const BodyAdminHome = () => import("./components/AdminHome.vue");

export default {
  name: 'app',
  components: {
    Header,
    BodyUserLogin,
    BodyVote,
    BodyAdminHome,
    AddVote
  },
  created: function(){
  },
  mounted: function(){
  },
  data: function(){
    return {
      head_config: {
        show_nav: false,
        pageTitle: "STV Elections"
      },
      admin_config: {
      },
      db_config: {},
      current_page: "login",
      currently_voting: -1,
      vote_config: {},
    }
  },
  methods: {
    config_fetched: function(payload){
      this.head_config.pageTitle = payload.mainTitle;
    },
    page_to_vote: function(payload){
      this.db_config = payload.config;
      this.head_config.show_nav = true;
      this.vote_config.rankings = Array(this.db_config.rankNumCandidates).fill("  ");

      this.current_page = "vote";
    },
    page_to_add_vote: function(payload){
      this.current_page = "add_vote";
      this.currently_voting = payload
    },
    page_return_to_vote: function(addedCandidate){
      this.current_page = "vote";
      if (addedCandidate != "  "){
        delete this.db_config.candidates[addedCandidate[0]];
        if (this.vote_config.rankings[this.currently_voting - 1] != "  "){
          this.delete_vote_from_ballot(this.currently_voting)
        }
        this.vote_config.rankings[this.currently_voting - 1] = addedCandidate;
      }
    },
    delete_vote_from_ballot: function(deletingRank){
      if (this.vote_config.rankings[deletingRank - 1] != "  "){
        this.db_config.candidates[this.vote_config.rankings[deletingRank-1][0]] = this.vote_config.rankings[deletingRank-1][1];
        this.vote_config.rankings[deletingRank-1] = "  ";
      }
    },
    swap_ranks_on_ballot: function(ranksToChange){
      const tmp = this.vote_config.rankings[ranksToChange[0]];
      this.vote_config.rankings[ranksToChange[0]] = this.vote_config.rankings[ranksToChange[1]];
      this.vote_config.rankings[ranksToChange[1]] = tmp;
    },
    fetched_user_info: function(userInfo){
      this.head_config.userPlaceholder = userInfo[0].email;
      this.head_config.user_uid = userInfo[0].uid;
      this.head_config.show_nav = true;
      this.head_config.user_is_admin = userInfo[1];
      this.admin_config.admin_uid = userInfo[0].uid;
    },
    firebase_sign_out: function(){
      firebase_auth_instance.signOut()
      window.location.reload(true);
    },
    change_page_to_home: function(){
      if (this.db_config){
        this.current_page = "login";
      } else{
        this.current_page = "vote"
      }
    },
    change_page_to_admin: function(){
      this.current_page = "admin";
    }
  }
}
</script>

<style>

u.link{
  color: blue;
  cursor: pointer;
}
u.link:active{
  color: red;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -o-user-select: none;
}
#warning{
  color: red;
}
#footer{
  color:black;
  position:fixed;;
  bottom:5px;
  width:98%;
  margin: 0 1%;
  text-align: left;
}
.lds-spinner {
  color: official;
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-spinner div {
  transform-origin: 40px 40px;
  animation: lds-spinner 1.2s linear infinite;
}
.lds-spinner div:after {
  content: " ";
  display: block;
  position: absolute;
  top: 20px;
  left: 37px;
  width: 4px;
  height: 12px;
  border-radius: 20%;
  background: black;
}
.lds-spinner div:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -1.1s;
}
.lds-spinner div:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: -1s;
}
.lds-spinner div:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: -0.9s;
}
.lds-spinner div:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: -0.8s;
}
.lds-spinner div:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: -0.7s;
}
.lds-spinner div:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: -0.6s;
}
.lds-spinner div:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: -0.5s;
}
.lds-spinner div:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: -0.4s;
}
.lds-spinner div:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: -0.3s;
}
.lds-spinner div:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: -0.2s;
}
.lds-spinner div:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: -0.1s;
}
.lds-spinner div:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0s;
}
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
