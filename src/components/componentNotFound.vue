<template>
<div id="top">
  <h2 class="display-2">Page Not Found</h2>
  <p style="padding:10px">
    The specified location was not found on this website. Please check the URL for mistakes and try again.
  </p>
  <span align="right"><router-link to="/">Home</router-link> | <span v-if="env.user.user_is_admin == 1"> <router-link to="/admin">Admin</router-link> | </span> <router-link to="/about">About</router-link></span>
</div>
</template>

<script>
export default {
  props: [
    "env"
  ]

}
</script>

<style scoped>
#top{
  margin-top: 5em;
}
</style>