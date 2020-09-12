<template>
<div id="top">
  <table id="table_vote" style="margin-bottom:15px;">
    <tr>
        <th>Rank</th>
        <th>Candidate</th>
        <th colspan=4 style="text-align: center;">Actions</th>
    </tr>
    <tr v-for="rank in env.config.rankNumCandidates" :key="rank">
      <td id="actions_vote" @click="tableTouch(rank)" style="padding: 10px 12pt;">
        <span>{{rank}}</span>
      </td>
      <td @click="tableTouch(rank)">
        {{env.ballot.vote[rank-1][1]}}
        <span v-if="rankActionShowSate(rank, 2)" style="color:#0008; font-style: italic;"><b>Click/tap</b> to add/edit</span>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 0)" @click="swapRanks(rank-1, rank-2)" class="linker" src="../assets/arrow_up.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 1)" @click="swapRanks(rank-1, rank)" class="linker" src="../assets/arrow_down.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 2)" @click="to_add_vote(rank)" class="linker" src="../assets/add.svg"/>
        <img v-if="rankActionShowSate(rank, 3)" @click="to_add_vote(rank)" class="linker" src="../assets/edit.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 4)" @click="delete_vote(rank)" class="linker" src="../assets/delete.svg"/>
      </td>
    </tr>
  </table>
  <button v-if="!show_spinner" @click="submitVote()">Submit vote</button>
  <div class="lds-grid" v-if="show_spinner && loader == 0"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-facebook" v-if="show_spinner && loader == 1"><div></div><div></div><div></div></div>
  <div class="lds-dual-ring" v-if="show_spinner && loader == 2"></div>
  <div class="lds-circle" v-if="show_spinner && loader == 3"><div></div></div>
  <div class="lds-throbbing" v-if="show_spinner && loader == 4"></div>
  <div class="lds-ring" v-if="show_spinner && loader == 5"><div></div><div></div><div></div><div></div></div>
  <div class="lds-roller" v-if="show_spinner && loader == 6"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-default" v-if="show_spinner && loader == 7"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-ellipsis" v-if="show_spinner && loader == 8"><div></div><div></div><div></div><div></div></div>
  <div class="lds-hourglass" v-if="show_spinner && loader == 9"></div>
  <div class="lds-ripple" v-if="show_spinner && loader == 10"><div></div><div></div></div>
  <div class="lds-spinner" v-if="show_spinner && loader == 11"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <p style="color: green;" v-if="warning_green !== ''"> {{warning_green}} </p>
  <p style="color: red;" v-if="warning_red !== ''"> {{warning_red}} </p>
  <p id="footer" style="text-align: left;">Entered with: {{env.ballot.codeword}}</p>
</div>
</template>

<script>
import {functions} from "@/App.vue";

const registerBallot = functions.httpsCallable("registerBallot");

export default {
  name: "VoteBody",
  props: [
    "env"
  ],
  mounted: function(){
    this.loader = Math.floor(Math.random()*12);
  },
  data: function(){
    const payload = {
      warning_red: "",
      warning_green: "",
      show_spinner: false,
      loader: 0,
    }
    return payload
  },
  methods: {
    to_add_vote: function(rank){
      this.$emit("updateEnv", {config: {adding_vote: rank}});
    },
    delete_vote: function(rank){
      const payload = {
        ballot: {
          vote: this.env.ballot.vote,
          candidates: this.env.ballot.candidates
        }
      };
      payload.ballot.candidates[this.env.ballot.vote[rank-1][0]] = this.env.ballot.vote[rank-1][1];
      payload.ballot.vote[rank-1] = "  ";
      this.$emit("updateEnv", payload);
      this.$forceUpdate();
    },
    swapRanks: function(rank0, rank1){
      const vote0 = this.env.ballot.vote[rank0];
      const vote1 = this.env.ballot.vote[rank1];
      const payload = {ballot: {
        vote: this.env.ballot.vote,
      }};
      payload.ballot.vote[rank0] = vote1;
      payload.ballot.vote[rank1] = vote0;
      this.$emit("updateEnv", payload);
      this.$forceUpdate();
    },
    tableTouch: function(rank){
      if (this.rankActionShowSate(rank, 2) || this.rankActionShowSate(rank, 3)){
        this.to_add_vote(rank);
      }
    },
    rankActionShowSate: function(rank, action){
      if ((action == 0) && (rank == 1)) return false;
      if ((action == 1) && (rank == this.env.config.rankNumCandidates)) return false;

      if (this.env.ballot.vote[rank-1] == "  "){
        if ([3, 4].includes(action)) return false;
        if (rank != 1){
          if (this.env.ballot.vote[rank-2] == "  "){
            if ([0, 2].includes(action)) return false;
          }
        }
        if (rank != this.env.config.rankNumCandidates){
          if (this.env.ballot.vote[rank] == "  "){
            if (action == 1) return false;
          }
        }
      } else{
        if (action == 2) return false;
      }
      return true;
    },
    submitVote: function(){
      this.warning_green = "";
      this.warning_red = "Submitting vote!!";
      this.show_spinner = true;
      let payload = Array(this.env.config.rankNumCandidates);
      let validBallot = true;
      if (this.env.ballot.vote[0] == "  "){
        this.warning_green = ""
        this.warning_red = "!! Need at least one vote";
        validBallot = false;
        this.show_spinner = false;
        this.loader = Math.floor(Math.random()*12);
        return;
      }
      for (let ballotIndex=0; ballotIndex<this.env.config.rankNumCandidates; ballotIndex++){
        payload[ballotIndex] = this.env.ballot.vote[ballotIndex][0];
        if ((this.env.ballot.vote[ballotIndex] == "  ") && (ballotIndex < this.env.config.minRankCandidates)){
          this.warning_green = ""
          this.warning_red = "!! Need more vote";
          validBallot = false;
          this.show_spinner = false;
          this.loader = Math.floor(Math.random()*12);
          return;
        }
        if (ballotIndex != 0){
          if ((this.env.ballot.vote[ballotIndex] != "  ") && (this.env.ballot.vote[ballotIndex-1] == "  ")){
            this.warning_green = ""
            this.warning_red = "!! All blank votes must appear at the end"
            validBallot = false;
            this.show_spinner = false;
            this.loader = Math.floor(Math.random()*12);
            return;
          }
        }
      }
      if (validBallot){
        payload.unshift(this.env.ballot.codeword);
        // fetch(
        //   // "http://localhost:5000/vote-1-for-soni/us-central1/registerBallot", {
        //   "/registerBallot", {
        //   method: "POST",
        //   body: JSON.stringify(payload)
        // }).then((response) => {
        //   response.text().then((data) => {
        //     if (data === "success"){
        //       this.warning_green = "Vote submitted successfully!!";
        //       this.warning_red = "Close tab or change location to leave safely.";
        //     } else{
        //       this.warning_green = "";
        //       this.warning_red = data;
        //     }
        //     this.show_spinner = false;
        //     this.loader = Math.floor(Math.random()*12);
        //   }).catch(() => {
        //     this.warning_green = ""
        //     this.warning_red = "!! Network or system error";
        //     this.show_spinner = false;
        //     this.loader = Math.floor(Math.random()*12);
        //   });
        // });
        registerBallot(payload).then((res) => {
          if (res.data === "success"){
            this.warning_green = "Vote submitted successfully!!";
            this.warning_red = "Close tab or navigate away to leave safely.";
          } else{
            this.warning_green = "";
            this.warning_red = res.data;
          }
        }).catch(() => {
          this.warning_green = ""
          this.warning_red = "!! Network or system error";
        }).then(() => {
          this.show_spinner = false;
          this.loader = Math.floor(Math.random()*12);
        });
      }
    }
  }
}
</script>

<style scoped>
#top{
  /* margin-top: 50pt; */
  margin-top: calc(7.5vh + 50px);
  text-align: center;
}
#table_vote {
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  border: 1px solid #ddd;
}
#table_vote td {
  border: 2px transparent;
  padding: 5px;
  text-align: left;
}
#table_vote tr:nth-child(odd){background-color: #fff;}
#table_vote tr:nth-child(even){background-color: #f0f0f0;}
#table_vote tr:hover {background-color: #ddd;}
#table_vote th {
  border: 2px transparent;
  padding: 12px 12px;
  text-align: left;
  background-color: #269926;
  color: white;
}
#table_vote #actions_vote{
  width: 25px;
}

button {
  background-color: #269926;
  color: whitesmoke;
  padding: 2px 10px;
  border: none;
  cursor: pointer;
  max-width: 220px;
  margin-top: 20px;
  margin-bottom: 10px;
  height: auto;
  min-height: 40px;
  font-weight: bold;
}
button:hover {
  background-color: snow;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px #269926;
}
button:active{
  background-color: #26992622;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px #269926;
  transition: all 0.05s;
}

img.linker{
  cursor: pointer;
}
</style>
