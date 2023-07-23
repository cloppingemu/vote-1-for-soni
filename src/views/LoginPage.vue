<template>
  <div class="home">
    <pageHeader />
    <loginBody :display="loginBodyDisplay" />
  </div>
</template>

<script>
import pageHeader from "@/components/pageHeader.vue";
import loginBody from "@/components/loginBody.vue";

export default {
  name: "LoginPage",
  components: {
    pageHeader,
    loginBody
  },
  computed: {
    env: function(){
      return this.$store.state.env;
    },
    loginBodyDisplay: function() {
      var heading = "";
      var waiting = "";
      if (this.env.config.accepting === null) {
        heading = "Fetching Config";
        waiting = "";
      } else if (!this.env.config.accepting) {
        heading = "";
        waiting = "Ballots are not currently being accepted";
      } else {
        heading = "Enter With Key"
        waiting = "";
      }
      return {
        heading: heading,
        waiting: waiting,
      };
    },
  },
  created: function() {
    this.$store.dispatch("update_all", {env: {
      current_page: "login"
    }});
  },
  methods: { },
}
</script>
