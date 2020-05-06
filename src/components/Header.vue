<template>
<div>
  <h1> {{head_config.pageTitle}} </h1>
  <object align="right" v-if="!['login', 'vote'].includes(current_page)"><u class="link" @click="go_to_home()">Home</u> | <b>Admin</b></object>
  <object align="right" v-if="current_page == 'vote'"><u @click="cancel_vote()" class="link">Close</u></object>
  <hr />
  <object align="right" style="text-align: right;" v-if="(head_config.show_nav && !(head_config.userPlaceholder == null))">
    Signed in as {{head_config.userPlaceholder}} <br />
    <u class=link @click="delete_self()" v-if="!head_config.user_is_admin">{{delete_message}}</u>&nbsp;<u @click="fb_signout()" class="link">{{deauth_message}}</u>
  </object>
  <br style="margin-bottom: 40px;"/><br />
</div>
</template>

<script>
import {functions} from "../App.vue";

export default {
  name: "Header",
  props: [
    "head_config",
    "current_page"
  ],
  data: function(){
    return {
      delete_message: "Delete me",
      deauth_message: "Sign out"
    }
  },
  mounted: function(){
  },
  methods:{
    fb_signout: function(){
      this.deauth_message = "Signing out"
      this.$emit("FirebaseDeauth");
    },
    go_to_home: function(){
      this.$emit("GotoHome");
    },
    cancel_vote: function(){
      window.location.reload(true);
    },
    delete_self: function(){
      const deregisterUser = functions.httpsCallable('deregisterUser');
      this.delete_message = "Deleting";
      deregisterUser({targetUid: this.head_config.user_uid}).then(() => {
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
</style>