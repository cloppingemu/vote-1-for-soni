<template>
<div id="top">
	<button class="cancel" @click="back_to_vote()">&times;</button><br />
	<button class="candidate" v-for="key in Object.keys(env.ballot.candidates).filter(key => env.ballot.candidates[key] !== null).sort(() => Math.random() - 0.5)" :key="key" @click="add_candidate(key)">{{env.ballot.candidates[key]}}</button>
</div>
</template>

<script>
export default {
  name: "AddVote",
  props: [
    "env"
  ],
  methods:{
    add_candidate: function(key){
      const payload = {
        config: {adding_vote: -1},
        ballot: {
          vote: this.env.ballot.vote,
          candidates: this.env.ballot.candidates
        }
      };
      if (this.env.ballot.vote[this.env.config.adding_vote-1] !== "  "){
        payload.ballot.candidates[this.env.ballot.vote[this.env.config.adding_vote-1][0]] = this.env.ballot.vote[this.env.config.adding_vote-1][1];
      }
      payload.ballot.vote[this.env.config.adding_vote-1] = [key, this.env.ballot.candidates[key]];
      payload.ballot.candidates[key] = null;

      this.$emit("updateEnv", payload);
    },
    back_to_vote: function(){
      this.$emit("updateEnv", {config: {adding_vote: -1}});
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
  text-shadow: 1px 0 1px #000, 0 -1px 1px #000, 0 1px 1px #000, -1px 0 1px #000;
  font-weight: bold;
}
.candidate:hover{
  margin: 1px auto;
  border: 1px solid #fff0;
  transition: all 0.1s linear;
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
  text-shadow: 1px 0 #000, -1px 0 #000, 0 1px #000, 0 -1px #000;
}
.cancel:hover{
  background-color: beige;
  transition: all 0.1s linear;
}
</style>