<template>
  <div class="home">
    <Header :env="env" @firebaseDeauth="fb_signout($event)"/>
    <LoginBody :env="env" @updateEnv="update_env($event)"/>
  </div>
</template>

<script>
import Header from "@/components/header.vue"
import LoginBody from "@/components/loginBody.vue"

import {firebase_auth_instance} from "@/App.vue";
import {ui} from "@/App.vue";
import {uiConfig} from "@/App.vue";

export default {
  name: "Login",
  components: {
    Header,
    LoginBody
  },
  props: [
    "env"
  ],
  mounted: function(){
    this.update_env({config: {current_page: "login"}});
    firebase_auth_instance.onAuthStateChanged((user) => {
      if (!user){
        ui.start("#firebaseui-auth-container", uiConfig);
      }
    });
  },
  methods: {
    fb_signout: function(event){
      this.$emit("firebaseDeauth", event);
    },
    update_env: function(update_obj){
      this.$emit("updateEnv", update_obj);
    }
  }
}
</script>
