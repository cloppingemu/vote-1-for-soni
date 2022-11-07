<template>
<div id="top">
  <table id="table_vote" style="margin-bottom:15px;" class="noselect">
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
        <span :style="rankActionShowSate(rank, 2) ? 'display:inherit' : 'display:none'" style="color:#0008; font-style: italic;"><b>Click/tap</b> to add/edit</span>
      </td>
      <td id="actions_vote">
        <img :style="rankActionShowSate(rank, 0) ? 'display:inherit' : 'display:none'" @click="swapRanks(rank-1, rank-2)" class="linker" src="../assets/arrow_up.svg" rel="preload" />
      </td>
      <td id="actions_vote">
        <img :style="rankActionShowSate(rank, 1) ? 'display:inherit' : 'display:none'" @click="swapRanks(rank-1, rank)" class="linker" src="../assets/arrow_down.svg" rel="preload" />
      </td>
      <td id="actions_vote">
        <img :style="rankActionShowSate(rank, 2) ? 'display:inherit' : 'display:none'" @click="toAddVote(rank)" class="linker" src="../assets/add.svg" rel="preload" />
        <img :style="rankActionShowSate(rank, 3) ? 'display:inherit' : 'display:none'" @click="toAddVote(rank)" class="linker" src="../assets/edit.svg" rel="preload" />
      </td>
      <td id="actions_vote">
        <img :style="rankActionShowSate(rank, 4) ? 'display:inherit' : 'display:none'" @click="deleteVote(rank)" class="linker" src="../assets/delete.svg" rel="preload" />
      </td>
    </tr>
  </table>
  <button v-if="!env.show_spinner" @click="submitVote()">Submit vote</button>
  <div class="lds-grid" v-if="env.show_spinner && loader == 0"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-facebook" v-if="env.show_spinner && loader == 1"><div></div><div></div><div></div></div>
  <div class="lds-dual-ring" v-if="env.show_spinner && loader == 2"></div>
  <div class="lds-circle" v-if="env.show_spinner && loader == 3"><div></div></div>
  <div class="lds-throbbing" v-if="env.show_spinner && loader == 4"></div>
  <div class="lds-ring" v-if="env.show_spinner && loader == 5"><div></div><div></div><div></div><div></div></div>
  <div class="lds-roller" v-if="env.show_spinner && loader == 6"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-default" v-if="env.show_spinner && loader == 7"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <div class="lds-ellipsis" v-if="env.show_spinner && loader == 8"><div></div><div></div><div></div><div></div></div>
  <div class="lds-hourglass" v-if="env.show_spinner && loader == 9"></div>
  <div class="lds-ripple" v-if="env.show_spinner && loader == 10"><div></div><div></div></div>
  <div class="lds-spinner" v-if="env.show_spinner && loader == 11"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
  <p style="color: green;" v-if="warning_green !== ''"> {{warning_green}} </p>
  <p style="color: red;" v-if="warning_red !== ''"> {{warning_red}} </p>
  <p id="footer" style="text-align: left;">Entered with: {{env.ballot.codeword}}</p>
</div>
</template>

<script>
import {registerBallot} from "@/firebaseInit";

export default {
  name: "voteBody",
  mounted: function() {
    this.loader = Math.floor(Math.random()*12);
  },
  data: function() {
    const payload = {
      warning_red: "",
      warning_green: "",
      loader: 0,
    }
    return payload
  },
  computed: {
    env: function() {
      return this.$store.state.env;
    }
  },
  methods: {
    toAddVote: function(rank) {
      this.$store.dispatch("update_ballot", {addingVote: rank});
    },
    deleteVote: function(rank) {
      const payload = {
        vote: [...this.env.ballot.vote],
        candidates: { }
      };
      payload.candidates[this.env.ballot.vote[rank-1][0]] = this.env.ballot.vote[rank-1][1];
      payload.vote[rank-1] = "  ";
      this.$store.dispatch("update_ballot", payload);
    },
    swapRanks: function(from, to) {
      this.$store.dispatch("swap_rankings", [from, to]);
    },
    tableTouch: function(rank) {
      if (this.rankActionShowSate(rank, 2) || this.rankActionShowSate(rank, 3)) {
        this.toAddVote(rank);
      }
    },
    rankActionShowSate: function(rank, action) {
      if ((action == 0) && (rank == 1)) return false;
      if ((action == 1) && (rank == this.env.config.rankNumCandidates)) return false;

      if (this.env.ballot.vote[rank-1] == "  ") {
        if ([3, 4].includes(action)) return false;
        if (rank != 1) {
          if (this.env.ballot.vote[rank-2] == "  ") {
            if ([0, 2].includes(action)) return false;
          }
        }
        if (rank != this.env.config.rankNumCandidates) {
          if (this.env.ballot.vote[rank] == "  ") {
            if (action == 1) return false;
          }
        }
      } else{
        if (action == 2) return false;
      }
      return true;
    },
    submitVote: function() {
      this.warning_green = "";
      this.warning_red = "Submitting vote!!";
      this.$store.dispatch("update_all", {env: {show_spinner: true}});
      let payload = Array(this.env.config.rankNumCandidates);
      let validBallot = true;
      if (this.env.ballot.vote[0] == "  ") {
        this.warning_green = ""
        if (this.env.ballot.vote.filter(s => s != "  ").length) {
          this.warning_red = "!! All blank votes must appear at the end";
        } else {
          this.warning_red = "!! Need at least one vote";
        }
        validBallot = false;
        this.$store.dispatch("update_all", {env: {show_spinner: false}});
        this.loader = Math.floor(Math.random()*12);
        return;
      }
      for (let ballotIndex=0; ballotIndex<this.env.config.rankNumCandidates; ballotIndex++) {
        payload[ballotIndex] = this.env.ballot.vote[ballotIndex][0];
        if ((this.env.ballot.vote[ballotIndex] == "  ") && (ballotIndex < this.env.config.minRankCandidates)) {
          this.warning_green = ""
          if (this.env.ballot.vote.filter(s => s != "  ").length >= this.env.config.minRankCandidates) {
            this.warning_red = "!! All blank votes must appear at the end";
          } else {
            this.warning_red = "!! Need more vote";
          }
          validBallot = false;
          this.$store.dispatch("update_all", {env: {show_spinner: false}});
          this.loader = Math.floor(Math.random()*12);
          return;
        }
        if (ballotIndex != 0) {
          if ((this.env.ballot.vote[ballotIndex] != "  ") && (this.env.ballot.vote[ballotIndex-1] == "  ")) {
            this.warning_green = ""
            this.warning_red = "!! All blank votes must appear at the end"
            validBallot = false;
            this.$store.dispatch("update_all", {env: {show_spinner: false}});
            this.loader = Math.floor(Math.random()*12);
            return;
          }
        }
      }
      if (validBallot) {
        payload.unshift(this.env.ballot.codeword);
        registerBallot(payload).then((res) => {
          if (res.data === "success") {
            this.warning_green = "Vote submitted successfully!!";
            this.warning_red = "Close tab or navigate away to leave safely.";
          } else {
            this.warning_green = "";
            this.warning_red = res.data;
          }
        }).catch(() => {
          this.warning_green = ""
          this.warning_red = "!! Network or system error";
        }).then(() => {
          this.$store.dispatch("update_all", {env: {show_spinner: false}});
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
#table_vote tr:nth-child(odd) {background-color: #fff;}
#table_vote tr:nth-child(even) {background-color: #f0f0f0;}
#table_vote tr:hover {background-color: #ddd;}
#table_vote th {
  border: 2px transparent;
  padding: 12px 12px;
  text-align: left;
  background-color: #1e811e;
  color: white;
}
#table_vote #actions_vote{
  width: 25px;
}

button {
  background-color: #1e811e;
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
  box-shadow: 4px 4px #1e811e;
}
button:active{
  background-color: #1e811e22;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px #1e811e;
  transition: all 0.05s;
}

img.linker{
  cursor: pointer;
}

#footer{
  position: fixed;
  bottom: 5px;
  width: 90%;
  margin: 0 3%;
}

</style>
