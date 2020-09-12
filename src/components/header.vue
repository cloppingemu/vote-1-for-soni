<template>
<div id="top">
  <h1> {{env.config.page_title}} </h1>
  <object align="right" v-if="env.config.current_page == 'vote'"><u @click="close()" class="link">Close</u></object>
  <object align="right" v-if="['about', '404', 'admin', 'login'].includes(env.config.current_page)"><router-link to="/">Home</router-link> | <span v-if="env.user.user_is_admin == 1"> <router-link to="/admin">Admin</router-link> | </span> <router-link to="/about">About</router-link></object>
  <hr />
  <object align="right" style="text-align: right;" v-if="env.config.show_nav">
    <span v-if="env.config.show_nav">Signed in {{env.user.user_placeholder}}</span> <br />
    <span class="loader" v-if="env.user.user_is_admin === -1"><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span><span class="loader-box"></span></span>
    <u class=link @click="delete_self()" v-if="env.user.user_is_admin === 0">{{delete_message}}</u> &nbsp; <u @click="fb_signout()" class="link" v-if="env.config.show_nav">{{deauth_message}}</u>
  </object>
</div>
</template>

<script>
import {functions} from "@/App.vue";

export default {
  name: "Header",
  props: [
    "env"
  ],
  data: function(){
    return {
      delete_message: "Delete me",
      deauth_message: "Sign out"
    }
  },
  mounted: function(){},
  methods:{
    fb_signout: function(){
      this.deauth_message = "Signing out"
      this.$emit("firebaseDeauth");
    },
    go_to_home: function(){
      this.$emit("GotoHome");
    },
    close: function(){
      this.$router.push("/");
      window.location.reload(true);
    },
    delete_self: function(){
      const deregisterUser = functions.httpsCallable('deregisterUser');
      this.delete_message = "Deleting";
      deregisterUser({targetUid: this.env.user.user_uid}).then(() => {
        this.fb_signout();
      }).catch(() => {
        this.delete_message = "Delete me";
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

.loader {
  margin-right : 4px;
  height       : 8px;
  width        : 56px; /* (6 * <margin: 0px>) + (7 * <width: 8px>) */
}
.loader-box {
  display                   : inline-block;
  height                    : 8px;
  width                     : 8px;
  margin-left               : 1px;
  background-color          : #06f8;
  animation                 : fadeOutIn 210ms cubic-bezier(1, 0, 0.707, 0) 840ms infinite alternate;
}
.loader-box:nth-child(1)  { animation-delay:  30ms; }
.loader-box:nth-child(2)  { animation-delay:  60ms; }
.loader-box:nth-child(3)  { animation-delay:  90ms; }
.loader-box:nth-child(4)  { animation-delay: 120ms; }
.loader-box:nth-child(5)  { animation-delay: 150ms; }
.loader-box:nth-child(6)  { animation-delay: 180ms; }
.loader-box:nth-child(7)  { animation-delay: 210ms; }
.loader-box:nth-child(8)  { animation-delay: 240ms; }
@keyframes fadeOutIn {
  0%   { background-color : #06f2; }
  100% { background-color : #06ff; }
}
</style>