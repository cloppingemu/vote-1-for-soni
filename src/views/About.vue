<template>
  <div class="home">
    <Header :env="env" @firebaseDeauth="fb_signout($event)"/>
    <div class="body">
      <p>
        This project is licensed under the Apache License, Version 2.0 (the "License"); you may not use contents of this repository except in compliance with the License. A copy of the License is in the LICENSE file and may also be obtained at <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>.
      </p>
      <p>
        Software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
      </p>
      <h2> Softwares used:</h2>
      <ul>
        <li><a href="https://vuejs.org/">Vue.js</a>: Javascript framework to control web elements.</li>
        <li><a href="https://www.npmjs.com/package/meeks-prf-js">Meeks-PRF-js</a>: Count votes for a Meek's method RCV / STV election contest using Javascript software. Reference algorithm described by the <a href="https://prfound.org/resources/reference/reference-meek-rule/"><i>Proportional Representation Foundation</i></a>.</li>
        <li><a href="https://firebase.google.com/docs/reference">NodeJS Firebase api</a>: <i>Database As A Service</i> provided by Google for a minimal backend.</li>
      </ul>
    </div>

  </div>
</template>

<script>
import Header from "@/components/header.vue"

export default {
  name: "Login",
  components: {
    Header
  },
  props: [
    "env"
  ],
  mounted: function(){
    this.$emit("updateEnv", {config: {current_page: "about"}})
  },
  methods: {
    fb_signout: function(event){
      this.$emit("firebaseDeauth", event);
    }
  }
}
</script>

<style scoped>
.body {
  margin-top: 5em;
}
p {
  width: 80%;
  max-width: 800pt;
}
ul {
  width: 80%;
  max-width: 800pt;
}
ul li{
  margin-bottom:10px;
}
</style>