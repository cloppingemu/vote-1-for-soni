import {createStore} from 'vuex';

const store = createStore({
  state: {
    env: {
      config: {
        accepting: null,
        // null: not sure yet
        // true: accepting
        // false: not accepting
        mainTitle: "[Election Name]",
        minRankCandidates: 420,
        numWinners: -420,
        rankNumCandidates: 69,
      },

      ballot: {
        candidates: {},
        vote: [],
        addingVote: -1,
        codeword: "",
        hash: ""
      },

      user: {
        auth: -1,  // authenticated??
        user_placeholder: "",
        user_uid: "",
        user_is_admin: -1,
        // -1: not sure yet
        //  0: not admin
        //  1: is admin
      },

      current_page: "login",
      show_spinner: true,
      warning: "",
    }
  },
  getters: {
    get_env: ((state) => {
      return state.env;
    }),
    get_env_config: ((state) => {
      return state.env.config;
    }),
  },
  mutations: {
    _update_state(state, payload) {
      function recurse_update(state, payload) {
        for (let key in payload) {
          if (typeof(payload[key]) == "object") {
            recurse_update(state[key], payload[key]);
          } else {
            state[key] = payload[key];
          }
        }
      }
      recurse_update(state, payload);
    },
    _swap_rankings(state, payload) {
      let ballot = state.env.ballot.vote;
      const temp = ballot[payload[0]];
      ballot[payload[0]] = ballot[payload[1]];
      ballot[payload[1]] = temp;
    }
  },
  actions: {
    update_all({commit}, payload) {
      commit("_update_state", payload);
    },
    update_ballot({commit}, payload) {
      commit("_update_state", {env: {
        ballot: payload
      }});
    },
    update_config({commit}, payload) {
      commit("_update_state", {env: {
        config: payload
      }});
    },
    update_user({commit}, payload) {
      commit("_update_state", {env: {
        user: payload
      }});
    },
    swap_rankings({commit}, payload) {
      commit("_swap_rankings", payload);
    }
  },
  modules: { }
});

export default store;
