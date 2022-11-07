import { initializeApp } from "firebase/app";
import keys from "@/firebaseKeys";


const firebaseConfig = {
  apiKey: keys.apiKey,
  authDomain: keys.authDomain,
  databaseURL: keys.databaseURL,
  projectId: keys.projectId,
  storageBucket: keys.storageBucket,
  messagingSenderId: keys.messagingSenderId,
  appId: keys.appId,
};


export const app = initializeApp(firebaseConfig);
const { initializeAppCheck, ReCaptchaV3Provider } = require("firebase/app-check");

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(keys.ReCaptchaV3Provider),
  isTokenAutoRefreshEnabled: true
});


import {getFunctions, httpsCallable} from 'firebase/functions';
const functions = getFunctions(app);
export const getConfig = httpsCallable(functions, "getConfig");
export const validateUser = httpsCallable(functions, "validateUser");
export const deregisterUser = httpsCallable(functions, "deregisterUser");
export const fetchCandidatesList = httpsCallable(functions, "fetchCandidatesList");
export const fetchCandidatesListByHash = httpsCallable(functions, "fetchCandidatesListByHash");
export const registerBallot = httpsCallable(functions, "registerBallot");

import {getAuth} from "firebase/auth";
export const auth = getAuth(app);
