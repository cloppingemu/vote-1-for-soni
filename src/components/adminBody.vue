<template>
<div id="top">

<div>
  <div class="noselect" style="text-align:right; min-height:80px;">
    <img v-if="!this.display.isLoading" @click="getDatabase(true)" alt="Reload" src="../assets/refresh.svg" style="width: 4%; height: auto;min-width: 40px; cursor: pointer;transform: translateY(20px);-webkit-transform: translateY(20px);-ms-transform: translateY(20px);" rel="preload">
    <div v-if="this.display.isLoading" class="lcl-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> <br />
  </div>

  <div class="config_group noselect">
    <div class="config_handle" @click="showConfigContent(0, true)">
      General configurations <span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
    </div>
    <div class="config_elements">
      <p>
        Currently {{database.config.accepting ? "" : "not"}} accepting responses
        <label @click="toggleAccepting()" class="switch"> <input type="checkbox" :checked="database.config.accepting" disabled> <span class="slider"></span></label>
        <br /><br class="bigBreak" />
        Election title: <br />
        <input v-model="database.config.mainTitle" @keydown.enter="commitBaseConfig()" ref="newTitle" @change="setConfigUnset(true)" @keydown="setConfigUnset(true)" @keyup="setConfigUnset(true)">
        <button class="commitConfigs blackBG" @click="runElection()" :disabled="display.isLoading">Run election</button> <br class="bigBreak" /> <br />
        Maximum number of candidates to rank: <br />
        <input type="number" v-model="database.config.rankNumCandidates" @keydown.enter="commitBaseConfig()" class="configInput" ref="newNumCandidates" @change="setConfigUnset(true)" @keydown="setConfigUnset(true)" @keyup="setConfigUnset(true)"> <br />
        Minimum number of candidates to rank: <br />
        <input type="number" v-model="database.config.minRankCandidates" @keydown.enter="commitBaseConfig()" class="configInput" ref="newMinRank" @change="setConfigUnset(true)" @keydown="setConfigUnset(true)" @keyup="setConfigUnset(true)"> <br />
        Number of winners: <br />
        <input type="number" v-model="database.config.numWinners" @keydown.enter="commitBaseConfig()" ref="newNumWinners" @change="setConfigUnset(true)" @keydown="setConfigUnset(true)" @keyup="setConfigUnset(true)">
        <button :class="'commitConfigs' + (display.configUnset ? ' configSetter' : '')" @click="commitBaseConfig()" :disabled="display.isLoading || !display.configUnset">Set</button>
      </p>
      <p id="warning">{{display.warning}}</p>
    </div>
  </div>

  <div class="config_group noselect">
    <div class="config_handle" @click="showConfigContent(1, true)">
      Candidates: {{Object.keys(database.candidates).length}}<span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
    </div>
    <div class="config_elements">
      <p>
        <input placeholder="New candidate" @keydown.enter="addCandidate()" ref="newCandidateName"><button class="commitConfigs blackBG" @click="addCandidate()" :disabled="display.isLoading">Add</button>
      </p>
      <p>
        <button class="commitConfigs blackBG" style="float:left; margin-right: 1%;" @click="deleteAllCandidates()" :disabled="display.isLoading">Delete all candidates</button>
      </p><br />
      <p id="warning">{{display.warning}}</p>
      <ul id="list_of_candidadates">
        <li v-for="key in sortedCandidateKeys(Object.keys(database.candidates))" :key="key">
          <img src="../assets/delete.svg" @click="deleteCandidate(key)" class="linker" />
          <img src="../assets/edit.svg" @click="editCandidate(key)" class="linker" />
          <span class="seletable">{{database.candidates[key]}}</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="config_group noselect">
    <div class="config_handle" @click="showConfigContent(2, true)">
      Codewords: {{countFullVotes()}} / {{Object.keys(database.ballots).length}} <span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
    </div>
    <div class="config_elements">
      <p>
        <input placeholder="New codeword" ref="newCodeword" @keydown.enter="addNewCodeword()" style="margin-bottom: 15px;"><button @click="addNewCodeword()" class="commitConfigs blackBG" :disabled="display.isLoading">Add</button>
      </p>
      <p>
        <button class="commitConfigs blackBG" style="float:left; margin-right: 1%;" @click="deleteAllVotes()" :disabled="display.isLoading">Delete all votes</button>
        <button class="commitConfigs blackBG" style="float:left; margin-right: 1%;" @click="deleteAllBallots()" :disabled="display.isLoading">Delete all codewords</button>
      </p><br />
      <p id="warning">{{display.warning}}</p>
      <ul id="list_of_codewords">
        <li v-for="codeword in Object.keys(database.ballots)" :key="codeword" class="seletable">
          <b>{{codeword}} </b>:<span class="noselect"> &nbsp;
          <a href="javascript:void(0)" class="CopyURL noselect" :data-clipboard-text="formHashURL(this.database.ballots[codeword].hash)">Copy URL</a> &nbsp;
          <a class="actionLink" href="javascript:void(0)" @click="deleteVote(codeword)">Delete vote</a> &nbsp;
          <a class="actionLink" href="javascript:void(0)" @click="deleteCodeword(codeword)">Delete codeword</a></span>
          <br /><em>Last modified: {{database.ballots[codeword].lastTime}}</em>
          <ul v-if="database.ballots[codeword].vote != '  '">
            <li v-for="(voteCandidate, indx) in database.ballots[codeword].vote" :key="indx">
              <span v-if="voteCandidate != '  '">{{indx+1}}.&nbsp;{{database.candidates[voteCandidate]}}</span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <div class="config_group noselect">
    <div class="config_handle" @click="showConfigContent(3, true)">
      Users: {{Object.keys(database.users).length}}<span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
    </div>
    <div class="config_elements">
      <p id="warning">{{display.warning}}</p>
      <p>
        <ul id="list_of_users">
          <li v-for="(user, index) in database.users" :key="user">
            <b class="seletable">{{user.displayName}}</b> &nbsp; <a href="javascript:void(0)" class="actionLink" @click="deleteUser(index)">Delete user</a>
            <ul>
              <li>E-mail: <span class="seletable">{{user.email}}</span> </li>
              <li>Admin:
                <label @click="toggleAdmin(index)" class="switchSmall"> <input type="checkbox" :checked="user.admin == true" :ref="index" disabled> <span class="sliderSmall"></span></label>
              </li>
            </ul>
          </li>
        </ul>
      </p>
    </div>
  </div>

  <div class="formActionsHolder noselect">
    <div class="formAction" @click="exportConfig()">
      Export Configuration
      <a id="downloadConfigAnchorElem" class="hidden"></a>
    </div>

    <div class="formAction" @click="showImportingFile()">
      Import Configuration
    </div>
  </div>

  <div class="scaryButton noselect" @click="deleteCurrentConfig(true)">
    Delete Configuration
  </div>
</div>

<div v-if="display.presentingResults" id="outPopUpBottom">
  <div id="outPopUpTop">
    <span class="closeX" @click="togglePresentingResults()">&times;</span>
    <div>
      <h3>Election Results</h3>
      <hr>
      <p>Number of winners: {{database.config.numWinners}}</p>
      <p>Minimum rankings: {{database.config.minRankCandidates}} </p>
      <p>Maximum rankings: {{database.config.rankNumCandidates}}</p>
      <hr>
      Winners:
      <div style="margin-top: 10px; list-style-type: none;">
        <ol>
          <li v-for="(candidate, index) in elResults.elected" :key="index">
            {{candidate}}
          </li>
        </ol>
      </div>
      <div style="text-align: center;">
        <button @click="downloadElectionResults()" style="float:none;" class="commitConfigs blackBG">Download Full Results</button>
        <a id="downloadResultsAnchorElem" class="hidden"></a>
      </div>
    </div>
  </div>
</div>

<div v-if="display.importingFile" id="outPopUpBottom">
  <div id="outPopUpTop">
    <span class="closeX" @click="hideImportingFile()">&times;</span>
    <div>
      <h3>Select a file</h3>
      Current election will be over-written. Always back up the current configurations for good measure. <br />
      <input type="file" style="margin-top: 24px; margin-left: 24px;" id="file"><br /><br />
      <span id="warning" >{{display.warning}}</span>
    </div>
  </div>
</div>

</div>
</template>


<script>
import {app, deregisterUser} from "@/firebaseInit"
import {getDatabase, set, update, get, ref, child} from "firebase/database";
const Meeks = require("meeks-prf-js");

const db = getDatabase(app);
const dbRef = ref(db);

import Clipboard from 'clipboard';
const clippy = new Clipboard('.CopyURL');
clippy.on("success", (m) => {
  m.trigger.innerText = "Copied";
  m.trigger.style.color = "#D00";
  setTimeout(() => {
    m.trigger.innerText = "Copy URL";
    m.trigger.style.color = "#42b983";
  }, 1500);
});

const DEFAULT_PANEL_COLOR = "#1e811e";
const HOVER_PANEL_COLOR = "#1a1";

export default {
  name: "adminBody",
  created: function() {
    this.getDatabase(true);
  },
  data: function() {
    return {
      database: {
        config: {
          accepting: true,
          mainTitle: "STV Elections",
          minRankCandidates: -1,
          numWinners: -1,
          rankNumCandidates: -1,
        },
        users: { },
        candidates: { },
        ballots: { }
      },
      display: {
        isLoading: true,
        warning: "",
        presentingResults: false,
        importingFile: false,
        configUnset: false,
      },
      elResults: {
        nbrSeatsToFill: -1,
        maxRankingLevels: -1,
        minRankingLevels: -1,
        elected: [],
        statuses: {}
      },
    };
  },
  methods: {
    setConfigUnset: function(v) {
      this.display.configUnset = v;
    },

    showConfigContent: function(groupNumber, clearWarning) {
      let display_content = document.getElementsByClassName('config_elements')[groupNumber];
      let indicator = document.getElementsByClassName("extd")[groupNumber];
      let config_handle = document.getElementsByClassName("config_handle")[groupNumber];
      if (display_content.style.maxHeight) {
        display_content.style.maxHeight = null;
        indicator.innerHTML = "&plus;"
        config_handle.style.backgroundColor = DEFAULT_PANEL_COLOR;
      } else {
        display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        indicator.innerHTML = "&minus;"
        config_handle.style.backgroundColor = HOVER_PANEL_COLOR;
      }
      if (clearWarning) {
        this.display.warning = "";
      }
    },
    refreshContentHeight: function(refreshContentIndex, clearWarning) {
      this.$nextTick(() => {
        for (let dispIndex in refreshContentIndex) {
          this.showConfigContent(refreshContentIndex[dispIndex], clearWarning);
          this.showConfigContent(refreshContentIndex[dispIndex], clearWarning);
        }
      });
    },
    updateDatabase: function(path, refreshContentIndex, clearWarning) {
      get(child(dbRef, path)).then((snapshot) => {
        var segments = path.substring(1).split('/');
        var cursor = this.database;
        var segment, i;
        for (i = 0; i < segments.length - 1; ++i) {
          segment = segments[i];
          cursor = cursor[segment];
        }
        cursor[segments[i]] = snapshot.val();

        if (refreshContentIndex.length) {
          this.refreshContentHeight(refreshContentIndex, clearWarning);
        }

        if (path == "/config") {
          this.$store.dispatch("update_config", snapshot.val());
        }
        this.display.isLoading = false;
      });
    },
    getDatabase: function(clearWarning) {
      this.display.isLoading = true;
      get(child(dbRef, "/")).then((snapshot) => {
        this.database = snapshot.val();
        this.$store.dispatch("update_config", this.database.config);
        this.refreshContentHeight([0, 1, 2, 3], clearWarning);
        this.display.isLoading = false;
      });
    },
    generateUUID: function() {
      // const uuidURL = URL.createObjectURL(new Blob);
      // return uuidURL.slice(uuidURL.length-36,);
      const rng = (l) => Math.random().toString(36).substring(2, 2+l);
      return `${rng(8)}-${rng(4)}-${rng(4)}-${rng(4)}-${rng(6)}${rng(6)}`;
    },
    getDateTime: function() {
      return `${new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"})} AEST`;
    },

    commitBaseConfig: function() {
      if (this.display.isLoading) {
        return;
      }
      this.display.isLoading = true;
      const newConfig = {
        mainTitle: this.database.config.mainTitle,
        accepting: this.database.config.accepting,
        minRankCandidates: parseInt(this.database.config.minRankCandidates),
        numWinners: parseInt(this.database.config.numWinners),
        rankNumCandidates: parseInt(this.database.config.rankNumCandidates),
      };
      const oldConfig = this.database.config;
      this.database.config = newConfig;
      update(ref(db, "/config"), newConfig).then(() => {
        this.getDatabase(true);
        this.setConfigUnset(false);
      }).catch(() => {
        this.database.config = oldConfig;
        this.display.warning = "!! Error pushing general configurations - Refresh page.";
        this.getDatabase(false);
      });
    },
    toggleAccepting: function() {
      if (this.display.isLoading) {
        return;
      }
      this.display.isLoading = true;
      set(ref(db, "/config/accepting"), !this.database.config.accepting).then(() => {
        this.getDatabase(true);
      });
    },
    runElection: function() {
      const nbrSeatsToFill = parseInt(this.database.config.numWinners);
      const maxRankingLevels = parseInt(this.database.config.rankNumCandidates);
      var candidates = "";
      var ballots = [];
      for (let candidateKey in this.database.candidates) {
        candidates = `${candidates} ${candidateKey}`;
      }
      for (let voteCandidateKey in this.database.ballots) {
        var rankings = "";
        if (this.database.ballots[voteCandidateKey].vote != "  ") {
          for (let rank in this.database.ballots[voteCandidateKey].vote) {
            if (this.database.ballots[voteCandidateKey].vote[rank] != "  ") {
              rankings = `${rankings} ${this.database.ballots[voteCandidateKey].vote[rank]}`;
            }
          }
        } else{
          rankings = " ";
        }
        ballots.unshift([1, rankings]);
      }
      const tieBreaker = candidates;
      const excluded = "";
      const protectedzz = "";
      const options = {};
      const progressCallback = null;
      const results = Meeks.tabulate(nbrSeatsToFill, candidates, ballots, maxRankingLevels, tieBreaker, excluded, protectedzz, options, progressCallback);

      this.elResults = {
        nbrSeatsToFill: nbrSeatsToFill,
        maxRankingLevels: maxRankingLevels,
        minRankingLevels: this.database.config.minRankCandidates,
        elected: [],
        statuses: {}
      };

      const elected = Array.from(results.elected).sort((a, b) => {
        return results.statuses[b].votes._valueAsInteger - results.statuses[a].votes._valueAsInteger;
      });
      for (let winner in elected) {
        this.elResults.elected.push(this.database.candidates[elected[winner]]);
      }
      this.togglePresentingResults();

      let statuses = {};
      for (let canIndex in results.statuses) {
        statuses[this.database.candidates[canIndex]] = results.statuses[canIndex].votes._valueAsInteger;
      }
      this.elResults.statuses = statuses;
    },
    togglePresentingResults: function() {
      this.display.presentingResults = !this.display.presentingResults;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      if (this.display.presentingResults) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    },
    downloadElectionResults: function() {
      const fileName = "results.json";
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.elResults));
      const dlAnchorElem = document.getElementById('downloadResultsAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", fileName);
      dlAnchorElem.click();
    },

    sortedCandidateKeys: function(keys) {
      return keys.sort((a, b) => {
        if (this.database.candidates[a].toLowerCase() < this.database.candidates[b].toLowerCase()) {
          return -1;
        }
        if (this.database.candidates[a].toLowerCase() > this.database.candidates[b].toLowerCase()) {
          return 1;
        }
        return 0;
      });
    },
    addCandidate: function() {
      if (this.display.isLoading) {
        return;
      }
      this.display.isLoading = true;
      const newName = this.$refs.newCandidateName.value.trim();
      if (newName.trim() == "") {
        this.display.isLoading = false;
        return;
      }
      const newKey = this.generateUUID();
      // this.database.candidates[newKey] = newName;
      // this.$forceUpdate();

      set(ref(db, `/candidates/${newKey}`), newName).then(() => {
        this.$refs.newCandidateName.value = "";
        this.database.candidates[newKey] = newName;
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error adding candidate - Refresh page.";
        this.getDatabase(false);
      });
    },
    deleteCandidate: function(key) {
      /*
        Delete candidate and shift remaining candidates up.
      */
      if (this.display.isLoading) {
        return;
      }
      if (Object.keys(this.database.candidates).length <= 1) {
        alert("!! Need at least one candidate in the elections at all times");
        return;
      }
      const r = confirm(`You are about to delete candidate ${this.database.candidates[key].toUpperCase()}. All votes containing them will be deleted too. Are you sure you want to continue?`);
      if (!r) {
        return;
      }
      this.isLoading = true;
      let Parr = [];
      for (let code in this.database.ballots) {
        if (this.database.ballots[code].vote != "  ") {
          let Ballot = this.database.ballots[code].vote;
          for (let indx in Ballot) {
            if (this.database.ballots[code].vote[indx] == key) {
              Ballot.splice(indx, 1);
              if (Ballot.length == 0) {
                Ballot = "  ";
              }
              Parr.push(update(ref(db, `/ballots/${code}`), {vote: Ballot, lastTime: this.getDateTime()}));
            }
          }
        }
      }
      Parr.push(set(ref(db, `/candidates/${key}`), null));
      Promise.all(Parr).then(()=>{
        this.getDatabase([1, 2], true);
      }).catch(() => {
        this.display.warning = "!! Error deleting candidate - Refresh page.";
        this.getDatabase([1, 2], false);
        this.isLoading = false;
      });
    },
    editCandidate: function(key) {
      if (this.display.isLoading) {
        return;
      }
      let newName = prompt(`Enter new name for candidate ${this.database.candidates[key]}.`, this.database.candidates[key]);
      if (newName == null) {
        return;
      } else if (newName.trim() == "") {
        this.display.warning = "!! Invalid candidate name.";
        this.getDatabase(false);
        return;
      }
      newName = newName.trim();
      this.display.isLoading = true;
      set(ref(db, `/candidates/${key}`), newName).then(() => {
        this.database.candidates[key] = newName;
        this.getDatabase(false);
      }).catch(() => {
        this.display.warning = "!! Failed to delete candidate - Refresh page.";
        this.getDatabase(false);
      });
    },
    deleteAllCandidates: function() {
      if (this.display.isLoading) {
        return;
      }
      const r = confirm(`You are about to delete all candidates and ballots. Are you sure?`);
      if (!r) {
        return;
      }
      this.display.isLoading = true;
      let payloadCandidates = {};
      payloadCandidates[this.generateUUID()] = "place holder 1";
      payloadCandidates[this.generateUUID()] = "place holder 2";
      let pCandidates = set(ref(db, `/candidates`), payloadCandidates);
      let payloadVotes = {};
      for (let word in this.database.ballots) {
        payloadVotes[word] = {
          lastTime: this.getDateTime(),
          vote: "  ",
          hash: this.database.ballots[word].hash
        };
      }
      let pBallot = set(ref(db, `/ballots`), payloadVotes);
      Promise.all([pCandidates, pBallot]).then(() => {
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error deleting all candidates."
        this.getDatabase(false);
      });
    },

    countFullVotes: function() {
      let filled = 0;
      for (let word in this.database.ballots) {
        filled += (this.database.ballots[word].vote !== "  ");
      }
      return filled;
    },
    addNewCodeword: function() {
      if (this.display.isLoading) {
        return;
      }
      const newCodeword = this.$refs.newCodeword.value.toLowerCase().trim();
      if (newCodeword == "" || newCodeword.includes(" ")) {
        this.display.warning = "!! Bad codeword";
        this.refreshContentHeight([2], false);
        return;
      } else if (Object.keys(this.database.ballots).includes(newCodeword)) {
        this.display.warning = "!! Codeword already exists";
        this.$refs.newCodeword.value = "";
        this.refreshContentHeight([2], false);
        return;
      }
      this.display.isLoading = true;
      const payload = {
        vote: "  ",
        lastTime: this.getDateTime(),
        hash: this.generateUUID(),
      };
      set(ref(db, `/ballots/${newCodeword}`), payload).then(() => {
        this.database.ballots[newCodeword] = payload;
        this.$refs.newCodeword.value = "";
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error adding codeword - Refresh page";
        this.getDatabase(false);
      });
    },
    deleteAllBallots: function() {
      if (this.display.isLoading) {
        return;
      }
      const r = confirm(`You are about to delete all vote for ballots. Are you sure?`);
      if (!r) {
        return;
      }
      this.display.isLoading = true;
      let payload = {
        placeholder: {
          lastTime: this.getDateTime(),
          vote: "  ",
          hash: this.generateUUID()
        }
      };
      set(ref(db, `/ballots`), payload).then(() => {
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error deleting all candidates - Refresh page"
        this.getDatabase(false);
      });
    },
    deleteVote: function(codewordKey, independent=false) {
      if (this.display.isLoading) {
        return;
      }
      if (independent) {
        const r = confirm(`You are about to delete the vote for codeword ${codewordKey}. Are you sure?`);
        if (!r) {
          return;
        }
      }
      this.display.isLoading = true;
      const payload = {
        "vote": "  ",
        "lastTime": this.getDateTime()
      };
      update(ref(db, `/ballots/${codewordKey}`), payload).then(() => {
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error deleting vote - Refresh page.";
        this.getDatabase(false);
      });
    },
    deleteCodeword: function(codewordKey) {
      if (this.display.isLoading) {
        return;
      }
      if (Object.keys(this.database.ballots).length <= 1) {
        alert("!! Need at least one candidate in the elections at all times");
        return;
      }
      const r = confirm(`You are about to delete the codeword ${codewordKey.toUpperCase()}. Are you sure?`);
      if (!r) {
        this.isLoading = false;
        return;
      }
      this.display.isLoading = true;
      set(ref(db, `/ballots/${codewordKey}`), null).then(() => {
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error deleting codeword - Refresh page";
        this.getDatabase(false);
      });
    },
    deleteAllVotes: function() {
      if (this.display.isLoading) {
        return;
      }
      const r = confirm(`You are about to delete all votes for all codeword. Are you sure?`);
      if (!r) {
        return;
      }
      this.display.isLoading = true;
      let payload = {};
      for (let word in this.database.ballots) {
        payload[word] = {
          lastTime: this.getDateTime(),
          vote: "  ",
          hash: this.database.ballots[word].hash,
        };
      }
      set(ref(db, `/ballots`), payload).then(() => {
        this.database.ballots = payload;
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error deleting all candidates - Refresh page"
        this.getDatabase(false);
      });
    },
    formHashURL: function(hash) {
      return `${window.location.host}/vote?ballot=${hash}`
    },

    toggleAdmin: function(userIndex) {
      if (this.display.isLoading) {
        return;
      }
      if (this.database.users[userIndex].admin) {
        let numAdmins = 0;
        for (let index in this.database.users) {
          if (this.database.users[index].admin) {
            numAdmins += 1;
          }
        }
        if (numAdmins < 2) {
          alert("!! Need at least one admin");
          this.$refs[userIndex][0].checked = true;
          this.display.isLoading = false;
          return;
        }
      }
      this.display.isLoading = true;
      set(ref(db, `/users/${userIndex}/admin`), !this.database.users[userIndex].admin).then(() => {
        if (userIndex == this.$store.state.env.user.user_uid){
          window.location.href = "/";
        }
        this.getDatabase(true);
      }).catch(() => {
        this.display.warning = "!! Error toggling admin - Refresh page.";
        this.getDatabase(false);
      });
    },
    deleteUser: function(userUid) {
      if (this.display.isLoading) {
          return;
      }
      let r = confirm(`User ${this.database.users[userUid].email} will be deleted. Are you sure you want to continue?`);
      if (!r) {
          return;
      }
      this.display.isLoading = true;
      deregisterUser({
        targetUid: userUid,
      }).then((result) => {
        const res = result.data;
        if (res.msg == "success") {
          if (this.$store.state.env.user.user_uid == userUid) {
            window.location.href = "/";
            setTimeout(() => {
              window.location.reload();
            }, 50);
          } else {
            this.getDatabase(true);
          }
        } else {
          this.display.warning = res.msg;
          this.getDatabase(false);
        }
      }).catch(() => {
        this.display.warning = "!! Error deleting user - Refresh the page.";
        this.getDatabase(false);
      });
    },

    exportConfig: function() {
      let payload = {
        candidates: [],
        config: this.database.config,
        ballots: {}
      };
      for (let key in this.database.ballots) {
        let ballot = Array();
        if (this.database.ballots[key].vote == "  ") {
          ballot.push(" ");
        } else {
          for (let index in this.database.ballots[key].vote) {
            ballot.push(this.database.candidates[this.database.ballots[key].vote[index]]);
          }
        }
        payload.ballots[key] = ballot;
      }
      for (let key in this.database.candidates) {
        payload.candidates.push(this.database.candidates[key]);
      }
      const fileName = "election_config.json";
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
      const dlAnchorElem = document.getElementById('downloadConfigAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", fileName);
      dlAnchorElem.click();
    },
    deleteCurrentConfig: function(independent) {
      return new Promise((resolve) => {
        if (independent) {
          const r = confirm(`Current election will be over-written. Do you want to continue?`);
          if (!r) {
            resolve();
            return;
          }
        }
        let updateObj = {ballots: {
          "placeholder": {
            lastTime: this.getDateTime(),
            vote: "  ",
            hash: this.generateUUID()
          }
        }};
        this.display.isLoading = true;
        updateObj.candidates = {};
        updateObj.candidates[this.generateUUID()] = "Place Holder Candidate 1";
        updateObj.candidates[this.generateUUID()] = "Place Holder Candidate 2";
        update(ref(db, "/"), updateObj).then(() => {
          if (independent) {
            this.getDatabase(true);
          }
          resolve();
        }).catch(() => {
          this.display.warning = "!! Error overwriting configuration- Refresh the page.";
          this.getDatabase(true);
          resolve();
        });
      });
    },
    hideImportingFile: function() {
      this.display.importingFile = false;
      document.body.style.overflow = "auto";
      this.display.warning = "";
    },
    showImportingFile: function() {
      this.display.importingFile = true;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      document.body.style.overflow = "hidden";
      this.$nextTick(() => {
        document.getElementById('file').addEventListener('change', (fileInput) => {
          let r = confirm(`${fileInput.target.files[0].name} has been selected for new configuration. Current election will be over-written. Do you want to continue?`);
          let reader = new FileReader();
          reader.onload = ((file) => {
            try{
              var newConfig = JSON.parse(file.target.result);
            } catch{
              this.display.warning = "!! Error parsing JSON file"
              return
            }

            let updateObj = {};
            let candidatesList = {};

            if (newConfig.candidates != null) {
              updateObj = {"candidates": {}};
              for (let num in newConfig.candidates) {
                candidatesList[newConfig.candidates[num]] = this.generateUUID();
                updateObj.candidates[candidatesList[newConfig.candidates[num]]] = newConfig.candidates[num];
              }
            }

            if (newConfig.ballots != null) {
              updateObj["ballots"] = {};
              for (let code in newConfig.ballots) {
                updateObj.ballots[code] = {};
                if (newConfig.ballots[code][0] !=  " ") {
                  updateObj.ballots[code].vote = [];
                  for (let vote in newConfig.ballots[code]) {
                    let newName = newConfig.ballots[code][vote];
                    if (newName != " ") {
                      let newNameCode = candidatesList[newName];
                      if (newNameCode == null) {
                        this.display.warning = "!! Error finding candidate names from ballot in the candidate list";
                        this.display.isLoading = true;
                        this.getDatabase(false);
                        return;
                      }
                      updateObj.ballots[code].vote.push(newNameCode);
                    } else {
                      updateObj.ballots[code].vote.push("  ");
                    }
                  }
                } else {
                  updateObj.ballots[code].vote = "  ";
                }
                updateObj.ballots[code].hash = this.generateUUID();
                updateObj.ballots[code].lastTime = this.getDateTime();
              }
            }

            if (newConfig.config != null) {
              updateObj.config = newConfig.config;
            }

            this.display.isLoading = true;
            this.deleteCurrentConfig(false).then(() => {
              update(ref(db, "/"), updateObj).then(() => {
                this.getDatabase(true);
              }).catch(() => {
                this.display.warning = "!! Failed to update database"
              });
            });
            this.hideImportingFile();
            // "this" refers to the vue component instance.
          });
          if (r) {
            reader.readAsText(fileInput.target.files[0]);
          } else {
            this.display.warning = "!! Action aborted";
          }
        });
      });
    },

  },
}
</script>


<style scoped>
div.config_handle{
  background-color: #1e811e;
  border: 1px solid whitesmoke;
  cursor: pointer;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  color: white;
  padding: 10px 10px 10px 10px;
  font-weight: bold;
}
div.config_handle:hover{
  opacity: 0.9;
  box-shadow: 0px 0px 2px black;
}
div.config_handle:active{
  opacity: 1;
  box-shadow: 0px 0px 1px black;
}
div.config_elements{
  background-color: #f7f7f7;
  max-height: 0px;
  overflow: hidden;
  transition: max-height 0.2s ease;
  padding: 0 20px;
}
div.config_elements br{
  margin: 5px 0;
}
#top{
  max-width: 750px;
  width: 100%;
  margin: 65px auto;
}

input.configInput{
  margin-bottom: 10px;
}

div.scaryButton{
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  color: white;
  font-weight: bold;
  background-color: darkred;
  margin: 40px auto;
  padding: 12px 12px;
  text-align: center;
  width: fit-content;
  cursor:default;
}
div.scaryButton:hover{
  background-color: white;
  border: 1px solid black;
  color: black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px 0 darkred;
}
div.scaryButton:active{
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px 0 darkred;
  background-color: #ffdddd;
  border: 1px solid black;
  color: black;
}

input[type="number"]{
  height: 12pt;
}

.switchSmall {
  position: relative;
  display: inline-block;
  margin-left: 5%;
  width: 42px;
  height: 23px;
}
.switchSmall input {
  opacity: 0;
  width: 0;
  height: 0;
}
.sliderSmall {
  border-radius: 25px;
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.sliderSmall:before {
  position: absolute;
  content: "";
  height: 17px;
  width: 17px;
  left: 3px;
  border-radius: 50%;
  bottom: 3px;
  background-color: white;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
input:checked + .sliderSmall {
  background-color: #1a881a;
}
input:checked + .sliderSmall:before {
  -webkit-transform: translateX(18px);
  -ms-transform: translateX(18px);
  transform: translateX(18px);
}

.switch {
  position: relative;
  display: inline-block;
  float: right;
  width: 52px;
  height: 25px;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  border-radius: 25px;
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.15s;
  transition: all 0.15s linear;
}
.slider:before {
  position: absolute;
  content: "";
  height: 19px;
  width: 19px;
  left: 4px;
  border-radius: 50%;
  bottom: 3px;
  background-color: white;
  -webkit-transition: 0.15s;
  transition: all 0.15s linear;
}
input:checked + .slider {
  background-color: #1a881a;
}
input:checked + .slider:before {
  -webkit-transform: translateX(25px);
  -ms-transform: translateX(25px);
  transform: translateX(25px);
}

button.commitConfigs {
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  float: right;
  color: white;
  font-weight: bold;
  padding: 6px 24px;
  border: 1px solid black;
  transition: color 0.05s ease;
}
button.commitConfigs:hover {
  background-color: white;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px black;
}
button.commitConfigs:active {
  background-color: snow;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px black;
  transition: color 0.05s;
}
button.commitConfigs:disabled {
  background-color: #C00;
  color: white;
  font-weight: bold;
  border: 1px solid black;
  transform: none;
  box-shadow: none;
  transition: color 0.05s;
}
button.configSetter:not(:hover) {
  animation-name: configSetterAnimation;
  animation-duration: 1s;
  animation-iteration-count: infinite;
    animation-timing-function: steps(1, end);
}
@keyframes configSetterAnimation {
  0%   {background-color:darkcyan;}
  50% {background-color:darkblue;}
}
button.blackBG {
  background-color: black;
}

br.bigBreak{
  margin-bottom: 20px;
}

.formActionsHolder{
  margin-top: 20px;
  padding: 6px;
}
.formAction{
  background-color: darkgoldenrod;
  text-align: center;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  color: white;
  font-weight: bold;
  padding: 12px 12px;
  margin: 6px auto;
  width: fit-content;
  text-align: center;
}
.formAction:hover{
  background-color: white;
  color: black;
  border: 1px solid black;
  margin: 4px auto;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px 0 darkgoldenrod;
}
.formAction:active{
  background-color: beige;
  color: black;
  border: 1px solid black;
  margin: 4px auto;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px 0 darkgoldenrod;
}

#list_of_codewords{
  list-style: disc;
  padding-left: 0;
  margin-left: 21px;
}
#list_of_codewords li{
  padding-left: 0;
  margin-bottom: 14px;
}
#list_of_codewords ul{
  list-style: none;
  padding-left: 0;
  padding-bottom: 0px;
}
#list_of_codewords ul li{
  margin: 5px 0;
}

#list_of_users{
  list-style: disc;
  padding-left: 0;
  margin-left: 21px;
}
#list_of_users li{
  padding-left: 0;
  margin-bottom: 14px;
}
#list_of_users ul{
  list-style: none;
  padding-left: 0;
  padding-bottom: 5px;
}
#list_of_users ul li{
  margin: 5px 0;
}

#list_of_candidadates{
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}
#list_of_candidadates li{
  padding-left: 0;
  margin-bottom: 3px;
}

#outPopUpBottom{
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 14;
  top: 0;
  left: 0;
  margin: 0;
  background: #ffffff40;
  overflow: scroll;
}
#outPopUpTop{
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  width: 90%;
  max-width: 540px;
  /* height: auto; */
  /* height: 300px; */
  margin: 15% auto;
  z-index: 15;
  background: #f7f7f7;
  border: solid 1px black;
}
#outPopUpTop .closeX{
  float: right;
  padding: 0.5% 1.7%;
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  color: #fff;
  background-color: #008a00;
  font-weight: bold;
  cursor: pointer;
  font-size: larger;
}
#outPopUpTop div{
  margin: 10% 2%;
}
#outPopUpTop h3{
  text-align: center;
}

img.linker{
  cursor: pointer;
  width: 30px;
  height: auto;
  transform: translateY(8px);
  -webkit-transform: translateY(8px);
  -ms-transform: translateY(8px);
}

.lcl-spinner {
  color: official;
  display: inline-block;
  position: relative;
  width: 60px;
  height: 60px;
}
.lcl-spinner div {
  transform-origin: 40px 40px;
  animation: lcl-spinner 1.2s linear infinite;
}
.lcl-spinner div:after {
  content: " ";
  display: block;
  position: absolute;
  top: 25px;
  left: 38px;
  width: 3px;
  height: 9px;
  border-radius: 15%;
  background: black;
}
.lcl-spinner div:nth-child(1) {
  transform: rotate(0deg);
  animation-delay: -1.1s;
}
.lcl-spinner div:nth-child(2) {
  transform: rotate(30deg);
  animation-delay: -1s;
}
.lcl-spinner div:nth-child(3) {
  transform: rotate(60deg);
  animation-delay: -0.9s;
}
.lcl-spinner div:nth-child(4) {
  transform: rotate(90deg);
  animation-delay: -0.8s;
}
.lcl-spinner div:nth-child(5) {
  transform: rotate(120deg);
  animation-delay: -0.7s;
}
.lcl-spinner div:nth-child(6) {
  transform: rotate(150deg);
  animation-delay: -0.6s;
}
.lcl-spinner div:nth-child(7) {
  transform: rotate(180deg);
  animation-delay: -0.5s;
}
.lcl-spinner div:nth-child(8) {
  transform: rotate(210deg);
  animation-delay: -0.4s;
}
.lcl-spinner div:nth-child(9) {
  transform: rotate(240deg);
  animation-delay: -0.3s;
}
.lcl-spinner div:nth-child(10) {
  transform: rotate(270deg);
  animation-delay: -0.2s;
}
.lcl-spinner div:nth-child(11) {
  transform: rotate(300deg);
  animation-delay: -0.1s;
}
.lcl-spinner div:nth-child(12) {
  transform: rotate(330deg);
  animation-delay: 0s;
}
@keyframes lcl-spinner {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.noscroll {
  overflow-y: hidden;
  height: 100%;
}

.hidden{
  display:none;
}
</style>