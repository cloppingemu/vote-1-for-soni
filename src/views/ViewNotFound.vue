<template>
  <div class="four04">
    <pageHeader />
    <loginBody :display="loginBodyDisplay" />
  </div>
</template>

<script>
import pageHeader from "@/components/pageHeader.vue";
import loginBody from "@/components/loginBody.vue";


export default {
  name: "AdminPage",
  components: {
    pageHeader,
    loginBody,
  },
  data: function() {
    return {
      loginBodyDisplay: {
        heading: "View Not Found",
        waiting: "",
      },
    };
  },
  created: function() {
    this.$store.dispatch("update_all", {env: {
      current_page: "four04"
    }});

    var message = "Redirecting in";
    var timeout = 3;
    var count = timeout;

    this.loginBodyDisplay.waiting = `${message} ${timeout}...`
    setTimeout(() => {
      this.$router.push("/");
    }, timeout*1000);

    while (timeout > 0) {
      setTimeout(() => {
        count = count - 1;
        this.loginBodyDisplay.waiting = `${message} ${count}...`;
      }, timeout * 1000);
      timeout = timeout - 1;
    }
  },
  computed: {
    env: function() {
      return this.$store.state.env;
    }
  },
}
</script>
