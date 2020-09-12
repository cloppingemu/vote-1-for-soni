<template>
<div class="404">
  <Header :env="env"  @firebaseDeauth="fb_signout($event)" />
  <ComponentNotFound :env="env"/>
</div>
</template>

<script>
import Header from "@/components/header.vue";
import ComponentNotFound from "@/components/componentNotFound.vue";

export default {
  name: "ViewNotFound",

  components: {
    Header,
    ComponentNotFound
  },

  props: [
    "env"
  ],

  mounted: function(){
    this.$emit("updateEnv", {config: {current_page: "404"}})
  },

  methods: {
    fb_signout: function(event){
      this.$emit("firebaseDeauth", event);
    },
  }

}
</script>