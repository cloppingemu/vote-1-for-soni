<template>
  <div class="home">
    <pageHeader v-if="env.ballot.addingVote < 0" />
    <loginBody v-if="env.ballot.codeword == '' || candidatesFetched == 0" :display="loginBodyDisplay" />
    <voteBody v-if="env.ballot.codeword != '' && candidatesFetched == 1" :style="ballotStyle('vote')" />
    <addVote v-if="env.ballot.codeword != '' && candidatesFetched == 1" :style="ballotStyle('cand')" />
  </div>
</template>

<script>
import pageHeader from "@/components/pageHeader.vue";
import loginBody from "@/components/loginBody.vue";
import voteBody from "@/components/voteBody.vue";
import addVote from "@/components/addVote.vue";

import {fetchCandidatesListByHash} from "@/firebaseInit";

export default {
  name: "VotePage",
  components: {
    pageHeader,
    loginBody,
    voteBody,
    addVote,
  },
  computed: {
    env: function() {
      return this.$store.state.env;
    }
  },
  data: function() {
    return {
      loginBodyDisplay: {
        heading: "Fetching configuration",
        waiting: "",
      },
      candidatesFetched: 0
    };
  },
  created: function() {
    if (this.env.ballot.codeword == "" && !this.$route.query.ballot) {
      this.$router.push("/");
    } else if (this.$route.query.ballot != "") {
      const hash = this.$route.query.ballot;
      fetchCandidatesListByHash([hash]).then((res) => {
        this.candidatesFetched = 1;
        if (res.data.msg == "success") {
          this.$store.dispatch("update_all", {env: {
            ballot: {
              candidates: res.data.people,
              codeword: res.data.codeword,
              vote: Array(this.env.config.rankNumCandidates).fill("  "),
            },
            show_spinner: false
          }});
        } else {
          this.$store.dispatch("update_all", {env: {
            warning: res.data.msg
          }}).then(() => {
            this.$router.push("/");
          });
        }
      });
    }
    this.$store.dispatch("update_all", {env: {
      current_page: "vote",
      show_spinner: false
    }});
  },
  methods: {
    ballotStyle: function(section) {
      const hide = "display: inherit";
      const show = "display: none"
      if (this.env.ballot.addingVote < 0) {
        if (section == "vote"){
          return hide;
        } else if (section == "cand") {
          return show;
        }
      } else {
        if (section == "vote") {
          return show;
        } else if (section == "cand") {
          return hide;
        }
      }
    }
  }
}
</script>
