<template>
<div id="top">
	<button class="cancel_addVote" @click="back_to_vote()">&times;</button><br />
	<button v-for="key in Object.keys(candidates).sort(() => Math.random() - 0.5)" :key="key" @click="add_candidate(key)">{{candidates[key]}}</button>
</div>
</template>

<script>
export default {
  name: "AddVote",
  props: [
    "candidates"
  ],
  methods:{
    add_candidate: function(key){
      const payload = [key, this.candidates[key]];
      this.$emit("ReturnToVote", payload);
    },
    back_to_vote: function(){
      this.$emit("ReturnToVote", "  ");
    }
  }
}
</script>


<style scoped>
#top{
  padding-bottom: 10px;
}
button{
  margin: 0 auto;
  max-width: 1000px;
  width: 100%;
  background-color: #2eb82e;
  color: white;
  padding: 10px;
  display: block;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  font-size: 20px;
  border: 1px solid green;
  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
  font-weight: bold;
}
.cancel_addVote{
  border-radius:50%;
  width:50px;
  height:50px;
  color:black;
  background-color:white;
  border: 2px solid red;
}
</style>