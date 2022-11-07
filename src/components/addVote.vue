<template>
<div id="top">
	<button class="cancel" @click="back_to_vote()">&times;</button><br />
	<button class="candidate" v-for="key in shuffleCandidates()" :key="key" @click="add_candidate(key)">
    {{env.ballot.candidates[key]}}
  </button>
</div>
</template>

<script>
export default {
  name: "AddVote",
  computed: {
    env: function() {
      return this.$store.state.env;
    }
  },
  methods:{
    shuffleCandidates: function() {
      let candidatesKeys = Object.keys(this.env.ballot.candidates);
      let candidates = candidatesKeys.filter((key) => {
        return this.env.ballot.candidates[key] != -1;
      });
      candidates = candidates.sort(() => Math.random() - 0.5);
      return candidates;
    },
    add_candidate: function(key) {
      const payload = {
        addingVote: -1,
        vote: this.env.ballot.vote,
        candidates: {}
      };
      if (this.env.ballot.vote[this.env.ballot.addingVote-1] !== "  ") {
        // if replacing vote, return vote to candidates pool
        payload.candidates[this.env.ballot.vote[this.env.ballot.addingVote-1][0]] = this.env.ballot.vote[this.env.ballot.addingVote-1][1];
      }
      payload.vote[this.env.ballot.addingVote-1] = [key, this.env.ballot.candidates[key]];
      payload.candidates[key] = -1;
      this.$store.dispatch("update_ballot", payload);
    },
    back_to_vote: function() {
      this.$store.dispatch("update_ballot", {addingVote: -1});
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
  width: 75%;
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
  width: 100%;
  background-color: white;
  color: #269926;
  text-shadow: none;
  transition: width 0.5s ease;
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
  background-color: red;
  color: white;
  transition: all 0.1s linear;
}
</style>