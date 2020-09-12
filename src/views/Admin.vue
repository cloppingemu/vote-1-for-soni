<template>
  <div class="admin">
    <Header :env="env" @firebaseDeauth="fb_signout($event)" />
    <AdminBody v-if="env.user.user_is_admin == 1" :env="env" @updateEnv="update_env($event)" @firebaseDeauth="fb_signout($event)" />
  </div>
</template>

<script>
import Header from "@/components/header.vue";
import AdminBody from "@/components/adminBody.vue";

export default {
  name: "Admin",
  components: {
    Header,
    AdminBody,
  },
  props: [
    "env"
  ],
  mounted: function(){
    this.update_env({config: {current_page: "admin"}});
    if (this.env.user.user_is_admin == 0){
      this.$router.push("/");
    }
  },
  methods: {
    fb_signout: function(event){
      this.$emit("firebaseDeauth", event);
    },
    update_env: function(update_obj){
      console.log(update_obj);
      this.$emit("updateEnv", update_obj);
    }
  }
}
</script>
