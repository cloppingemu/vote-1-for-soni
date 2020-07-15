<template>
<div id="top">
  <table id="table_vote">
    <tr>
        <th>Rank</th>
        <th>Candidate</th>
        <th colspan=4 style="text-align: center;">Actions</th>
    </tr>
    <tr v-for="rank in back_config.rankNumCandidates" v-bind:key="rank">
      <td id="actions_vote" @click="tableTouch(rank)" style="padding: 10px 12pt;">
        <span>{{rank}}</span>
      </td>
      <td @click="tableTouch(rank)">
        {{vote_config.rankings[rank-1][1]}}
        <span v-if="rankActionShowSate(rank, 2)" style="color:#0008; font-style: italic;"><b>Click/tap</b> to add/edit</span>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 0)" @click="swapRanks(rank-1, rank-2)" class="linker" src="../assets/arrow_up.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 1)" @click="swapRanks(rank-1, rank)" class="linker" src="../assets/arrow_down.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 2)" @click="toAddVote(rank)" class="linker" src="../assets/add.svg"/>
        <img v-if="rankActionShowSate(rank, 3)" @click="toAddVote(rank)" class="linker" src="../assets/edit.svg"/>
      </td>
      <td id="actions_vote">
        <img v-if="rankActionShowSate(rank, 4)" @click="deleteVote(rank)" class="linker" src="../assets/delete.svg"/>
      </td>
    </tr>
  </table>
  <button v-if="!show_spinner" @click="submitVote()">Submit vote</button>
  <div class="lds-spinner" v-if="show_spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <p style="color: green;" v-if="warning_green !== ''"> {{warning_green}} </p>
  <p style="color: red;" v-if="warning_red !== ''"> {{warning_red}} </p>
  <p id="footer" style="text-align: left;">Entered with: {{back_config.codeword}}</p>
</div>
</template>

<script>
export default {
  name: "BodyVote",
  props: [
    "back_config",
    "vote_config"
  ],
  mounted: function(){},
  data: function(){
    const payload = {
      warning_red: "",
      warning_green: "",
      show_spinner: false,
    }
    return payload
  },
  methods: {
    toAddVote: function(rank){
      this.$emit("AddingCandidate", rank);
    },
    deleteVote: function(rank){
      this.$emit("DeletingVote", rank);
      this.$forceUpdate();
    },
    swapRanks: function(rank0, rank1){
      this.$emit("SwapRanks", [rank0, rank1]);
      this.$forceUpdate();
    },
    tableTouch: function(rank){
      if (this.rankActionShowSate(rank, 2) || this.rankActionShowSate(rank, 3)){
        this.toAddVote(rank);
      }
    },
    rankActionShowSate: function(rank, action){
      if ((action == 0) && (rank == 1)) return false;
      if ((action == 1) && (rank == this.back_config.rankNumCandidates)) return false;

      if (this.vote_config.rankings[rank-1] == "  "){
        if ([3, 4].includes(action)) return false;
        if (rank != 1){
          if (this.vote_config.rankings[rank-2] == "  "){
            if ([0, 2].includes(action)) return false;
          }
        }
        if (rank != this.back_config.rankNumCandidates){
          if (this.vote_config.rankings[rank] == "  "){
            if (action == 1) return false;
          }
        }
      } else{
        if (action == 2) return false;
      }
      return true;
    },
    submitVote: function(){
      this.warning_green = ""
      this.warning_red = "Submitting vote!!";
      this.show_spinner = true;
      let payload = Array(this.back_config.rankNumCandidates);
      let validBallot = true;
      if (this.vote_config.rankings[0] == "  "){
        this.warning_green = ""
        this.warning_red = "!! Need at least one vote";
        validBallot = false;
        this.show_spinner = false;
        return;
      }
      for (let ballotIndex=0; ballotIndex<this.back_config.rankNumCandidates; ballotIndex++){
        payload[ballotIndex] = this.vote_config.rankings[ballotIndex][0];
        if ((this.vote_config.rankings[ballotIndex] == "  ") && (ballotIndex < this.back_config.minRankCandidates)){
          this.warning_green = ""
          this.warning_red = "!! Need more vote";
          validBallot = false;
          this.show_spinner = false;
          return;
        }
        if (ballotIndex != 0){
          if ((this.vote_config.rankings[ballotIndex] != "  ") && (this.vote_config.rankings[ballotIndex-1] == "  ")){
            this.warning_green = ""
            this.warning_red = "!! All blank votes must appear at the end"
            validBallot = false;
            this.show_spinner = false;
            return;
          }
        }
      }
      if (validBallot){
        payload.unshift(this.back_config.codeword);
        fetch(
          // "http://localhost:5000/cshc-elections/us-central1/registerBallot", {
          "/registerBallot", {
          method: "POST",
          body: JSON.stringify(payload)
        }).then((response) => {
          response.text().then((data) => {
            if (data === "success"){
              this.warning_green = "Vote submitted successfully!!";
              this.warning_red = "Close tab or change location to leave safely.";
            } else{
              this.warning_green = "";
              this.warning_red = data;
            }
            this.show_spinner = false;
          }).catch(() => {
            this.warning_green = ""
            this.warning_red = "!! Network or system error";
            this.show_spinner = false;
          });
        });
      }
    }
  }
}
</script>

<style scoped>
#top{
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
  color: white;
  padding: 12px 16px;
  margin: 12px 0;
  border: none;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}
button:hover {
  opacity: 0.9;
  box-shadow: 0 0 3pt #666;
}
button:active{
  opacity: 1;
  box-shadow: 0 0 1px #666;
}
img.linker{
  cursor: pointer;
}
</style>
