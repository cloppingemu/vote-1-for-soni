<template>
  <div class="admin">
    <pageHeader />
    <bodyAdminHome v-if="env.user.user_is_admin == 1" />
    <loginBody v-if="env.user.user_is_admin != 1 || !admin_body_loaded.v" :display="loginBodyDisplay" />
  </div>
</template>

<script>
import {defineAsyncComponent, reactive} from "vue";

import pageHeader from "@/components/pageHeader.vue";
import loginBody from "@/components/loginBody.vue";

let _admin_body_loaded = reactive({v: false});

export default {
  name: "AdminPage",
  components: {
    pageHeader,
    loginBody,
    bodyAdminHome: defineAsyncComponent(() => {
      return new Promise((resolve) => {
        import(
          /* webpackChunkName: "adminBody" */
          /* webpackMode: "lazy" */
          /* webpackPrefetch: true */
          /* webpackPreload: true */
          "@/components/adminBody.vue").then((component) => {
            resolve(component);
            _admin_body_loaded.v = true;
          }
        );
      });
    }),
  },
  data: function() {
    return {
      loginBodyDisplay: {
        heading: "Checking Authorization",
        waiting: "",
      },
      admin_body_loaded: _admin_body_loaded,
    };
  },
  created: function() {
    this.$store.dispatch("update_all", {env: {
      current_page: "admin"
    }});
  },
  computed: {
    env: function() {
      return this.$store.state.env;
    },
  },
}


</script>
