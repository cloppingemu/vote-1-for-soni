<template>
<div id="top">
  <h1 class="stealthLink noselect" @click="close()"> {{env.config.mainTitle}} </h1>
  <object align="right" v-if="env.current_page == 'vote'"><a href="javascript:void(0)" @click="close()">Close</a></object>
  <object align="right" class="noselect" v-if="['about', 'four04', 'admin', 'login'].includes(env.current_page)"><router-link to="/">Home</router-link> | <span v-if="env.user.user_is_admin == 1"> <router-link to="/admin">Admin</router-link> | </span> <router-link to="/about">About</router-link></object>
  <hr />
  <object align="right" style="text-align: right;" v-if="env.user.auth && env.user.user_placeholder != '' && env.current_page != 'vote'">
    <span>{{env.user.user_placeholder}}</span><br />
    <span class="noselect" v-if="env.user.user_is_admin == 0"><a href="javascript:void(0)" @click="deleteMe()">{{delete_message}}</a></span>&nbsp;
    <span class="loader noselect" v-if="env.user.user_is_admin === -1"><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span></span>
    <span class="noselect"><a href="." @click="signOutApp" ref="signout-lnk">{{deauth_message}}</a></span>
  </object>
</div>
</template>

<script>
import {auth} from "@/firebaseInit";
import {signOut} from "firebase/auth";
import {deregisterUser} from "@/firebaseInit";


export default {
  name: "pageHeader",
  props: [ ],
  data: function() {
    return {
      delete_message: "Delete me",
      deauth_message: "Sign out"
    }
  },
  mounted: function() { },
  computed: {
    env: function() {
      return this.$store.getters.get_env;
    }
  },
  methods: {
    close: function() {
      this.$router.push("/").then(() => {
        window.location.reload();
      });
      // setTimeout(() => {
      // }, 50);
    },
    deleteMe: function() {
      this.delete_message = "Deleting";
      deregisterUser({
        targetUid: this.$store.state.env.user.user_uid,
      }).then(() => {
        this.delete_message = "";
        this.deauth_message = "Signing out"
        setTimeout(() => {
          this.$refs["signout-lnk"].click();
        }, 100);
      });
    },
    signOutApp: function() {
      this.deauth_message = "Signing out";
      signOut(auth).then(() => {
        this.$router.push("/");
      });
    }
  }
}
</script>

<style scoped>
h1 {
  text-align: left;
  display: inline;
}

.stealthLink:hover {
  color: black;
}

</style>