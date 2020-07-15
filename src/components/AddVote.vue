<template>
<div id="top">
	<button class="cancel" @click="back_to_vote()">&times;</button><br />
	<button class="candidate" v-for="key in Object.keys(candidates).sort(() => Math.random() - 0.5)" :key="key" @click="add_candidate(key)">{{candidates[key]}}</button>
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
.candidate{
  margin: 0 auto;
  max-width: 1000px;
  width: 100%;
  background-color: #269926;
  padding: 10px;
  display: block;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  font-size: 20px;
  border: 1px solid green;
  color: white;
  text-shadow: 1px 0 0.5px #000, 0 -1px 0.5px #000, 0 1px 0.5px #000, -1px 0 0.5px #000;
  font-weight: bold;
  transition: border 0.1s ease-in-out;
}
.candidate:hover{
  margin: 1px auto;
  border: 1px solid white;
  text-shadow: 1px 0 1.5px #000, -1px 0 1.5px #000, 0 1px 1.5px #000, 0 -1px 1.5px #000;
  transition: all 0.25s ease-in-out;
}
.cancel{
  max-width: 1000px;
  display: block;
  font-weight: bold;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  font-size: 20px;
  margin: 0 auto;
  border-radius: 50%;
  width:50px;
  height:50px;
  color:black;
  background-color: white;
  border: 2px solid red;
}
.cancel:hover{
  background-color: beige;
  text-shadow: 1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000;
  transition: all 0.1s ease-in-out;
}
</style>