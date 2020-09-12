<template>
<div id="top">

<div>
<div style="text-align:right; min-height:80px;">
  <img v-if="!this.isLoading" src="../assets/refresh.svg" style="width: 4%; height: auto;min-width: 40px; cursor: pointer;transform: translateY(20px);-webkit-transform: translateY(20px);-ms-transform: translateY(20px);" @click="get_all_config()">
  <div v-if="this.isLoading" class="lcl-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div> <br />
</div>

<div class="config_group">
  <div class="config_handle" @click="show_config_content(0)">
    General configurations <span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
  </div>
  <div class="config_elements">
    <p>
      Currently {{isAcceptingNo()}} accepting responses
      <label @click="toggle_accepting()" class="switch"> <input type="checkbox" :checked="all_config.config.accepting == true" disabled> <span class="slider"></span></label>
      <br /><br class="bigBreak" />
      Election title: <br />
      <input :value="all_config.config.mainTitle" @keydown.enter="commitBaseConfigs()" ref="newTitle">
      <button class="commitConfigs" @click="runElection()">Run election</button> <br class="bigBreak" /> <br />
      Maximum number of candidates to rank: <br />
      <input type="number" :value="all_config.config.rankNumCandidates" @keydown.enter="commitBaseConfigs()" ref="newNumCandidates"> <br />
      Minimum number of candidates to rank: <br />
      <input type="number" :value="all_config.config.minRankCandidates" @keydown.enter="commitBaseConfigs()" ref="newMinRank"> <br />
      Number of winners: <br />
      <input type="number" :value="all_config.config.numWinners" @keydown.enter="commitBaseConfigs()" ref="newNumWinners">
      <button class="commitConfigs" @click="commitBaseConfigs()">Set</button>
    </p>
    <p id="warning">{{warning}}</p>
  </div>
</div>

<div class="config_group">
  <div class="config_handle" @click="show_config_content(1)">
    Candidates: {{Object.keys(all_config.candidates).length}}<span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
  </div>
  <div class="config_elements">
    <p>
      <input placeholder="New candidate" @keydown.enter="addCandidate()" ref="newCandidateName"><button class="commitConfigs" @click="addCandidate()">Add</button>
    </p>
    <p>
      <button class="commitConfigs" style="float:left; margin-right: 1%;" @click="deleteAllCandidates()">Delete all candidates</button>
    </p><br />
    <p id="warning">{{warning}}</p>
    <ul id="list_of_candidadates">
      <li v-for="key in sortedCandidateKeys(Object.keys(all_config.candidates))" :key="key">
        <img src="../assets/delete.svg" @click="deleteCandidate(key)" class="linker" />
        <img src="../assets/edit.svg" @click="editCandidate(key)" class="linker" />
        <span class="seletable">{{all_config.candidates[key]}}</span>
      </li>
    </ul>
  </div>
</div>

<div class="config_group">
  <div class="config_handle" @click="show_config_content(2)">
    Codewords: {{countFullVotes()}} / {{Object.keys(all_config.ballots).length}}<span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
  </div>
  <div class="config_elements">
    <p>
      <input placeholder="New codeword" ref="newCodeword" @keydown.enter="addNewCodeword()" style="margin-bottom: 15px;"><button @click="addNewCodeword()" class="commitConfigs">Add</button>
    </p>
    <p>
      <button class="commitConfigs" style="float:left; margin-right: 1%;" @click="deleteAllVotes()">Delete all vote</button>
      <button class="commitConfigs" style="float:left; margin-right: 1%;" @click="deleteAllBallots()">Delete all codewords</button>
    </p><br />
    <p id="warning">{{warning}}</p>
    <ul id="list_of_codewords">
      <li v-for="(codeword, index) in Object.keys(all_config.ballots)" :key="index">
        <b class="seletable">{{codeword}}</b>: &nbsp; <u class="link" @click="deleteVote(codeword)">Delete vote</u> &nbsp; <u class="link" @click="deleteCodeword(codeword)"> Delete codeword</u>
        <span v-if="all_config.test_token != all_config.ballots[codeword].test" id="warning"><br />!! Invalid or missing challenge. Ballot may have been forged. <u class="link" @click="fixMissingChallenge(codeword)">Fix</u></span>
        <br /><em>Last modified: {{all_config.ballots[codeword].lastTime}}</em>
        <ul v-if="all_config.ballots[codeword].vote != '  '">
          <li v-for="(voteCandidate, indx) in all_config.ballots[codeword].vote" :key="indx">
            <span v-if="voteCandidate != '  '">{{indx+1}}.&nbsp;{{voteCandidate[1]}}</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</div>

<div class="config_group">
  <div class="config_handle" @click="show_config_content(3)">
    Users: {{Object.keys(all_config.users).length}}<span style="float:right; font-size:larger;" class="extd">&plus;</span><br />
  </div>
  <div class="config_elements">
    <p id="warning">{{warning}}</p>
    <p>
      <ul id="list_of_users">
        <li v-for="(user, index) in all_config.users" :key="index">
          <b class="seletable">{{user.displayName}}</b> <u class="link" @click="deleteUser(index)">Delete user</u>
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

<div class="formActionsHolder">
  <div class="formAction" @click="exportConfig()">
    Export configurations
    <a id="downloadConfigAnchorElem" class="hidden"></a>
  </div>

  <div class="formAction" @click="showImportingFile()">
    Import configurations
  </div>
</div>

<div class="scaryButton" @click="deleteCurrentConfig()">
  Create new form
</div>
</div>

<div v-if="importingFile" id="outPopUpBottom">
  <div id="outPopUpTop">
    <span class="closeX" @click="hideImportingFile()">&times;</span>
    <div>
      <h3>Select a file</h3>
      Current election will be over-written. Always back up the current configurations for good measure. <br />
      <input type="file" style="margin-top: 24pt; margin-left: 24pt;" id="file">
      <span id="warning">{{warning}}</span>
    </div>
  </div>
</div>


<div v-if="presentingResults" id="outPopUpBottom">
  <div id="outPopUpTop">
    <span class="closeX" @click="togglePresentingResults()">&times;</span>
    <div>
      <h3>Election Results</h3>
      <hr>
      <p>Number of winners: {{all_config.config.numWinners}}</p>
      <p>Minimum rankings: {{all_config.config.minRankCandidates}} </p>
      <p>Maximum rankings: {{all_config.config.rankNumCandidates}}</p>
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
        <button @click="downloadElectionResults()" style="float:none;" class="commitConfigs">Download Full Results</button>
        <a id="downloadResultsAnchorElem" class="hidden"></a>
      </div>
    </div>
  </div>
</div>

</div>
</template>

<script>
import {firebase} from "../App.vue";
require("firebase/database");
export const db = firebase.database()

import {functions} from "../App.vue";
const Meeks = require("meeks-prf-js");

export default {
  name: "BodyAdminHome",
  props:[
    "env"
  ],
  mounted: function(){
    this.get_all_config(false);
  },
  data: function(){
    const payload = {
      isLoading: false,
      all_config: {
        config: {
          accepting: -1,
          minRankCandidates: -1,
          rankNumCandidates: -1
        },
        users:{},
        ballots: {},
        candidates: {}
      },
      importingFile: false,
      presentingResults: false,
      warning: "",
      elResults: {
        nbrSeatsToFill: -1,
        maxRankingLevels: -1,
        minRankingLevels: -1,
        elected: [],
        statuses: {}
      }
    }
    return payload;
  },
  methods:{
    sortedCandidateKeys: function(keys){
      return keys.sort((a, b)=>{
        if (this.all_config.candidates[a] < this.all_config.candidates[b]){
          return -1;
        }
        if (this.all_config.candidates[a] > this.all_config.candidates[b]){
          return 1;
        }
        return 0;
      });
    },
    deleteAllCandidates: function(){
      const r = confirm(`You are about to delete all candidates and ballots. Are you sure?`);
      if (!r){
        return;
      }
      this.isLoading = true;
      let payloadCandidates = {};
      payloadCandidates[this.generateUUID()] = "place holder 1";
      payloadCandidates[this.generateUUID()] = "place holder 2";
      let p1 = db.ref(`/${this.all_config.test_token}/candidates`).set(payloadCandidates);
      let payloadVotes = {};
      for (let word in this.all_config.ballots){
        payloadVotes[word] = {
          lastTime: this.getDateTime(),
          vote: "  ",
          test: this.all_config.test_token
        };
      }
      let p2 = db.ref(`/ballots`).update(payloadVotes);
      Promise.all([p1, p2]).then(() =>{
        this.get_all_config();
        this.isLoading = false;
      }).catch(() => {
        this.warning = "!! Error deleting all candidates."
        this.get_all_config();
        this.isLoading = false;
      });
    },
    countFullVotes: function(){
      let filled = 0;
      for (let word in this.all_config.ballots){
        filled += (this.all_config.ballots[word].vote !== "  ");
      }
      return filled;
    },
    hideImportingFile: function(){
      this.importingFile = false;
      document.body.style.overflow = "auto";
      this.warning = "";
    },
    togglePresentingResults: function(){
      this.presentingResults = !this.presentingResults;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      if (this.presentingResults){
        document.body.style.overflow = "hidden";
      } else{
        document.body.style.overflow = "auto";
      }
    },
    fixMissingChallenge: function(codeword){
      this.isLoading = true;
      db.ref(`/ballots/${codeword}/`).update({
        lastTime: this.getDateTime(),
        test: this.all_config.test_token,
      }).then(() => {
        this.get_all_config();
      }).catch(() => {
        this.warning = "!! Error fixing challenge - Refresh page";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[2];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    deleteUser: function(userUid){
      let r = confirm(`User ${this.all_config.users[userUid].email} will be deleted. Are you sure you want to continue?`);
      if (!r){
        return;
      }
      this.isLoading = true;
      const deregisterUser = functions.httpsCallable('deregisterUser');
      deregisterUser({
        targetUid: userUid,
      }).then((message) => {
        if (message.data == "success"){
          if (this.env.user.user_uid == userUid){
            this.fb_signout();
          } else{
            this.get_all_config();
          }
        } else{
          this.warning = message.data;
          this.$nextTick(() => {
            const display_content = document.getElementsByClassName('config_elements')[3];
            display_content.style.maxHeight = `${display_content.scrollHeight}px`;
          });
          this.isLoading = false;
        }
      }).catch(() => {
        this.warning = "!! Error deleting user - Refresh the page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[3];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    fb_signout: function(){
      this.$emit("firebaseDeauth");
    },
    show_config_content: function(groupNumber){
      let config_handle = document.getElementsByClassName("config_handle")[groupNumber];
      let display_content = document.getElementsByClassName('config_elements')[groupNumber];
      let indicator = document.getElementsByClassName("extd")[groupNumber];
      if (display_content.style.maxHeight){
        display_content.style.maxHeight = null;
        indicator.innerHTML = "&plus;"
        config_handle.style.backgroundColor = "#2eb82e";
      } else{
        display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        indicator.innerHTML = "&minus;"
        config_handle.style.backgroundColor = "#1a881a";
      }
      this.warning = "";
    },
    get_all_config: function(adjustContentHeight=true){
      this.isLoading = true;
      db.ref("/").once("value").then((snapshot) => {
        this.all_config.users = snapshot.val().users;
        this.all_config.config = snapshot.val().config;
        this.all_config.ballots = snapshot.val().ballots;

        this.$emit("updateEnv", {config: {
          page_title: this.all_config.config.mainTitle,
          accepting: this.all_config.config.accepting,
          minRankCandidates: this.all_config.config.minRankCandidates,
          numWinners: this.all_config.config.numWinners,
          rankNumCandidates: this.all_config.config.rankNumCandidates,
        }});

        let ks = Object.keys(snapshot.val());
        for (let i=0; i < ks.length; i++){
          if (!['users', 'config', 'ballots'].includes(ks[i])){
            this.all_config.candidates = snapshot.val()[ks[i]].candidates;
            this.all_config.test_token = ks[i];
          }
        }
        this.$forceUpdate();
        if (adjustContentHeight){
          this.$nextTick(() => {
            for (let dispIndex in [0,1,2,3]){
              this.show_config_content(dispIndex);
              this.show_config_content(dispIndex);
            }
          });
        }
        this.isLoading = false;
      });
    },
    toggle_accepting: function(){
      this.isLoading = true;
      db.ref("/config/accepting").set(!this.all_config.config.accepting);
      this.get_all_config();
    },
    isAcceptingNo: function(){
      if (this.all_config.config.accepting == false){
        return "not";
      }
    },
    exportConfig: function(){
      let payload = {
        candidates: [],
        config: this.all_config.config,
        ballots: {}
      }
      for (let key in this.all_config.ballots){
        let ballot = Array();
        if (this.all_config.ballots[key].vote == "  "){
          ballot.push(" ")
        } else{
          for (let index in this.all_config.ballots[key].vote){
            ballot.push(this.all_config.ballots[key].vote[index][1]);
          }
        }
        payload.ballots[key] = ballot;
      }
      for (let key in this.all_config.candidates){
        payload.candidates.push(this.all_config.candidates[key]);
      }
      const fileName = "election_config.json";
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
      const dlAnchorElem = document.getElementById('downloadConfigAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", fileName);
      dlAnchorElem.click();
    },
    generateUUID: function(){
      // const uuidURL = URL.createObjectURL(new Blob);
      // return uuidURL.slice(uuidURL.length-36,);
      const rng = (l) => Math.random().toString(36).substring(2, 2+l);
      return `${rng(8)}-${rng(4)}-${rng(4)}-${rng(4)}-${rng(6)}${rng(6)}`;
    },
    showImportingFile: function(){
      this.importingFile = true;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      document.body.style.overflow = "hidden";
      this.$nextTick(() => {
        document.getElementById('file').addEventListener('change', (fileInput) => {
          let r = confirm(`${fileInput.target.files[0].name} has been selected for new configuration. Current election will be over-written. Do you want to continue?`);
          let reader = new FileReader();
          reader.onload = (event) => {
            try{
              var newConfig = JSON.parse(event.target.result);
            } catch{
              this.warning = "!! Error parsing JSON file. Data has not yet been overwritten."
              return
            }

            let updateObj = {};
            let new_test_token = this.deleteCurrentConfig(false);
            let candidatesList = {};

            if (newConfig.candidates != null){
              updateObj[new_test_token] = {"candidates": {}};
              for (let num in newConfig.candidates){
                candidatesList[newConfig.candidates[num]] = this.generateUUID();
                updateObj[new_test_token].candidates[candidatesList[newConfig.candidates[num]]] = newConfig.candidates[num];
              }
              updateObj[this.all_config.test_token] = null;
            }

            if (newConfig.ballots != null){
              updateObj["ballots"] = {};
              for (let code in newConfig.ballots){
                updateObj.ballots[code] = {};
                if (newConfig.ballots[code][0] !=  " "){
                  updateObj.ballots[code].vote = [];
                  for (let vote in newConfig.ballots[code]){
                    let newName = newConfig.ballots[code][vote];
                    if (newName != " "){
                      let newNameCode = candidatesList[newName];
                      if (newNameCode == null){
                        this.warning = "!! Error matching candidate names. Data was over-written."
                        this.get_all_config();
                        return
                      }
                      updateObj.ballots[code].vote.push([newNameCode, newName]);
                    } else{
                      updateObj.ballots[code].vote.push("  ");
                    }
                  }
                } else{
                  updateObj.ballots[code].vote = "  ";
                }
                updateObj.ballots[code].test = new_test_token;
                updateObj.ballots[code].lastTime = this.getDateTime();
              }
            }

            if (newConfig.config != null){
              updateObj.config = newConfig.config;
            }
            db.ref("/").update(updateObj).then(() => {
              this.get_all_config();
            });
            this.hideImportingFile();
            // "this" refers to the vue component instance.
          };
          if (r){
            reader.readAsText(fileInput.target.files[0]);
          } else{
            this.warning = "!! Action aborted";
          }
        });
      });
    },
    deleteCurrentConfig: function(independent=true){
      if (independent){
        const r = confirm(`Current election will be over-written. Do you want to continue?`);
        if (!r){
          return
        }
      }
      const new_test_token = this.generateUUID();
      let updateObj = {
        ballots: {
          "placeholder":{
            lastTime: this.getDateTime(),
            test: new_test_token,
            vote: "  "
          }
        },
      };
      updateObj[this.all_config.test_token] = null;
      updateObj[new_test_token] = {
        candidates: {}
      };
      updateObj[new_test_token].candidates[this.generateUUID()] = "Place Holder Candidate 1"
      updateObj[new_test_token].candidates[this.generateUUID()] = "Place Holder Candidate 2"
      db.ref("/").update(updateObj)
      if (independent){
        this.get_all_config();
      } else{
        return new_test_token;
      }
    },
    commitBaseConfigs: function(){
      this.isLoading = true;
      const newTitle = this.$refs.newTitle.value.trim();
      const newNumCandidates = this.$refs.newNumCandidates.value.trim();
      const newMinRank = this.$refs.newMinRank.value.trim();
      const newNumWinners = this.$refs.newNumWinners.value.trim();
      db.ref("/config").update({
        mainTitle: newTitle,
        rankNumCandidates: parseInt(newNumCandidates),
        minRankCandidates: parseInt(newMinRank),
        numWinners: parseInt(newNumWinners)
      }).then(() => {
        this.get_all_config();
        this.$emit("updateEnv", {config: {
          page_title: newTitle,
          rankNumCandidates: newNumCandidates,
          numWinners: newNumWinners,
          minRankCandidates: newNumCandidates
        }});
      }).catch(() => {
        this.warning = "!! Error pushing general configurations - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[0];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    // deleteCandidate: function(key){
    //   /*
    //     Delete candidate and all votes containing the candidate.
    //   */
    //   if (Object.keys(this.all_config.candidates).length <= 1){
    //     alert("!! Need at least one candidate in the elections at all times");
    //     return;
    //   }
    //   const r = confirm(`You are about to delete candidate ${this.all_config.candidates[key].toUpperCase()}. All votes containing them will be deleted too. Are you sure you want to continue?`);
    //   if (!r){
    //     return;
    //   }
    //   this.isLoading = true;
    //   for (let code in this.all_config.ballots){
    //     if (this.all_config.ballots[code].vote != "  "){
    //       for (let index in this.all_config.ballots[code].vote){
    //         if (this.all_config.ballots[code].vote[index] != "  "){
    //           if (this.all_config.ballots[code].vote[index][0] == key){
    //             this.deleteVote(code, false);
    //           }
    //         }
    //       }
    //     }
    //   }
    //   db.ref(`/${this.all_config.test_token}/candidates/${key}`).set(null).then(()=>{
    //     this.get_all_config();
    //   }).catch(() => {
    //     this.warning = "!! Error deleting candidate - Refresh page.";
    //     this.$nextTick(() => {
    //       const display_content = document.getElementsByClassName('config_elements')[1];
    //       display_content.style.maxHeight = `${display_content.scrollHeight}px`;
    //     });
    //     this.isLoading = false;
    //   });
    // },
    deleteCandidate: function(key){
      /*
        Delete candidate and shift remaining candidates up.
      */
      if (Object.keys(this.all_config.candidates).length <= 1){
        alert("!! Need at least one candidate in the elections at all times");
        return;
      }
      const r = confirm(`You are about to delete candidate ${this.all_config.candidates[key].toUpperCase()}. All votes containing them will be deleted too. Are you sure you want to continue?`);
      if (!r){
        return;
      }
      this.isLoading = true;
      let Parr = [];
      for (let code in this.all_config.ballots){
        if (this.all_config.ballots[code].vote != "  "){
          let Ballot = this.all_config.ballots[code].vote;
          for (let indx in Ballot){
            if (this.all_config.ballots[code].vote[indx][0] == key){
              Ballot.splice(indx, 1);
              if (Ballot.length == 0){
                Ballot = "  ";
              }
              Parr.push(db.ref(`/ballots/${code}/vote`).set(Ballot));
            }
          }
        }
      }
      Parr.push(db.ref(`/${this.all_config.test_token}/candidates/${key}`).set(null));
      Promise.all(Parr).then(()=>{
        this.get_all_config();
      }).catch(() => {
        this.warning = "!! Error deleting candidate - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[1];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    editCandidate: function(key){
      const newName = prompt(`Enter new name for candidate ${this.all_config.candidates[key]}.`).trim();
      this.isLoading = true;
      let Parr = [
        db.ref(`/${this.all_config.test_token}/candidates/${key}`).set(newName)
      ];
      for (let code in this.all_config.ballots){
        if (this.all_config.ballots[code].vote != "  "){
          let Ballot = this.all_config.ballots[code].vote;
          for (let indx in Ballot){
            if (this.all_config.ballots[code].vote[indx][0] == key){
              let payload = {
                vote: this.all_config.ballots[code].vote,
                lastTime: this.getDateTime(),
                test: this.all_config.test_token
              };
              payload.vote[indx][1] = newName;
              Parr.push(db.ref(`/ballots/${code}`).set(payload));
            }
          }
        }
      }
      Promise.all(Parr).then(() => {
        this.get_all_config();
      })
    },
    deleteAllVotes: function(){
      const r = confirm(`You are about to delete all votes for all codeword. Are you sure?`);
      if (!r){
        return;
      }
      this.isLoading = true;
      let payload = {};
      for (let word in this.all_config.ballots){
        payload[word] = {
          lastTime: this.getDateTime(),
          vote: "  ",
          test: this.all_config.test_token
        };
      }
      db.ref(`/ballots`).update(payload).then(() =>{
        this.get_all_config();
        this.isLoading = false;
      }).catch(() => {
        this.warning = "!! Error deleting all candidates."
        this.get_all_config();
        this.isLoading = false;
      });
    },
    deleteAllBallots: function(){
      const r = confirm(`You are about to delete all vote for ballots. Are you sure?`);
      if (!r){
        return;
      }
      this.isLoading = true;
      let payload = {
        placeholder: {
          lastTime: this.getDateTime(),
          vote: "  ",
          test: this.all_config.test_token
        }
      };
      db.ref(`/ballots`).set(payload).then(() =>{
        this.get_all_config();
        this.isLoading = false;
      }).catch(() => {
        this.warning = "!! Error deleting all candidates."
        this.get_all_config();
        this.isLoading = false;
      });
    },
    addCandidate: function(){
      this.isLoading = true;
      const newName = this.$refs.newCandidateName.value.trim();
      if (newName.trim() == ""){
        this.isLoading = false;
        return;
      }
      var newKey = this.generateUUID();
      this.all_config.candidates[newKey] = newName;
      this.$forceUpdate();
      db.ref(`/${this.all_config.test_token}/candidates/${newKey}`).set(newName).then(() => {
        this.$refs.newCandidateName.value = "";
        this.get_all_config();
      }).catch(() => {
        this.warning = "!! Error adding candidate - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[1];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
      this.$nextTick(() => {
        const display_content = document.getElementsByClassName('config_elements')[1];
        display_content.style.maxHeight = `${display_content.scrollHeight}px`;
      });
    },
    deleteCodeword: function(codewordKey){
      if (Object.keys(this.all_config.ballots).length <= 1){
        alert("!! Need at least one candidate in the elections at all times");
        return;
      }
      const r = confirm(`You are about to delete the codeword ${codewordKey.toUpperCase()}. Are you sure?`);
      if (!r){
        this.isLoading = false;
        return;
      }
      this.isLoading = true;
      db.ref(`/ballots/${codewordKey}`).set(null).then(() => {
        this.get_all_config();
      }).catch(() => {
        this.warning = "!! Error deleting codeword - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[2];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    deleteVote: function(codewordKey, independent=false){
      if (independent){
        const r = confirm(`You are about to delete the vote for codeword ${codewordKey}. Are you sure?`);
        if (!r){
          return;
        }
      }
      this.isLoading = true;
      db.ref(`/ballots/${codewordKey}`).update({
        "vote": "  ",
        "lastTime": this.getDateTime()
      }).then(() => {
        this.get_all_config();
        this.isLoading = false;
      }).catch(() => {
        this.warning = "!! Error deleting vote - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[3];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    getDateTime: function(){
      return `${new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"})} AEST`;
    },
    addNewCodeword: function(){
      const newCodeword = this.$refs.newCodeword;
      if (newCodeword.value.trim() == "" || newCodeword.value.trim().includes(" ")){
        this.warning = "!! Bad codeword";
        return;
      }
      this.all_config.ballots[newCodeword.value.toLowerCase().trim()] = {
        "lastTime": "Working",
        "test": "Working",
        "vote": "  "
      };
      this.$forceUpdate();
      db.ref(`/ballots/${newCodeword.value.toLowerCase().trim()}`).set({
        "vote": "  ",
        "lastTime": this.getDateTime(),
        "test": this.all_config.test_token
      }).then(() => {
        this.get_all_config();
        newCodeword.value = ""
      }).catch(() => {
        this.warning = "!! Error adding codeword - Refresh page";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[1];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    toggleAdmin: function(userIndex){
      if  (this.all_config.users[userIndex].admin){
        let numAdmins = 0;
        for (let index in this.all_config.users){
          if (this.all_config.users[index].admin){
            numAdmins += 1;
          }
        }
        if (numAdmins < 2){
          alert("!! Need at least one admin");
          this.$refs[userIndex][0].checked = true;
          this.isLoading = false;
          return;
        }
      }
      this.isLoading = true;
      db.ref(`/users/${userIndex}/admin`).set(!this.all_config.users[userIndex].admin).then(() => {
        this.get_all_config();
      }).catch(() => {
        this.warning = "!! Error toggling admin - Refresh page.";
        this.$nextTick(() => {
          const display_content = document.getElementsByClassName('config_elements')[3];
          display_content.style.maxHeight = `${display_content.scrollHeight}px`;
        });
        this.isLoading = false;
      });
    },
    runElection: function(){
      const nbrSeatsToFill = parseInt(this.all_config.config.numWinners);
      const maxRankingLevels = parseInt(this.all_config.config.rankNumCandidates);
      var candidates = "";
      var ballots = [];
      for (let index in this.all_config.candidates){
        candidates = candidates.concat(" ", index)
      }
      for (let index in this.all_config.ballots){
        var rankings = "";
        if (this.all_config.ballots[index].vote != "  "){
          for (let rank in this.all_config.ballots[index].vote){
            if (this.all_config.ballots[index].vote[rank] != "  "){
              rankings = rankings.concat(" ", this.all_config.ballots[index].vote[rank][0]);
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
      const results = Meeks.tabulate(nbrSeatsToFill, candidates, ballots, maxRankingLevels, tieBreaker, excluded, protectedzz, options, progressCallback)

      this.elResults = {
        nbrSeatsToFill: nbrSeatsToFill,
        maxRankingLevels: maxRankingLevels,
        minRankingLevels: this.all_config.config.minRankCandidates,
        elected: [],
        statuses: {}
      };

      const elected = Array.from(results.elected).sort((a, b) => {
        return results.statuses[b].votes._valueAsInteger - results.statuses[a].votes._valueAsInteger;
      });
      for (let winner in elected){
        this.elResults.elected.push(this.all_config.candidates[elected[winner]]);
      }
      this.togglePresentingResults();

      let statuses = {};
      for (let canIndex in results.statuses){
        statuses[this.all_config.candidates[canIndex]] = results.statuses[canIndex].votes._valueAsInteger;
      }
      this.elResults.statuses = statuses;

    },
    downloadElectionResults: function(){
      const fileName = "results.json";
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.elResults));
      const dlAnchorElem = document.getElementById('downloadResultsAnchorElem');
      dlAnchorElem.setAttribute("href", dataStr);
      dlAnchorElem.setAttribute("download", fileName);
      dlAnchorElem.click();
    }
  }
}
</script>


<style scoped>
.seletable{
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  -o-user-select: text;
  user-select: text;
}

div.config_handle{
  background-color: #2eb82e;
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

button.commitConfigs{
  font-family: "Trebuchet MS", Arial, Helvetica, sans-serif;
  float: right;
  background-color: black;
  color: white;
  font-weight: bold;
  padding: 6px 24px;
  border: none;
  transition: color 0.05s ease;
}
button.commitConfigs:hover{
  background-color: white;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-4px) translateY(-4px);
  box-shadow: 4px 4px black;
}
button.commitConfigs:active{
  background-color: snow;
  color: black;
  font-weight: bold;
  border: 1px solid black;
  transform: translateX(-2px) translateY(-2px);
  box-shadow: 2px 2px black;
  transition: all 0.05s;
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