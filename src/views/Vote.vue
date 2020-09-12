<template>
  <div class="home">
    <Header v-if="env.config.adding_vote<0" :env="env" @firebaseDeauth="fb_signout($event)" />
    <VoteBody v-if="env.config.adding_vote<0" :env="env" @updateEnv="update_env($event)" />
    <AddVote v-if="env.config.adding_vote>=0" :env="env" @updateEnv="update_env($event)" />
  </div>
</template>

<script>
import Header from "@/components/header.vue";
import VoteBody from "@/components/voteBody.vue";
import AddVote from "@/components/addVote.vue";

export default {
  name: "Login",
  components: {
    Header,
    VoteBody,
    AddVote
  },
  props: [
    "env",
  ],
  mounted: function(){
    if (this.env.ballot.codeword === ""){
      this.$router.push("/");
    }
    this.update_env({config: {current_page: "vote"}})
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
