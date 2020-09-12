import {serviceAccount} from "./keys-vote-1-for-soni";
const functions = require('firebase-functions');
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
const db = admin.database();

// const CORS_TARGET = `${serviceAccount.project_id}.web.app`;
// const CORS_TARGET = `*`;

export const registerUser = functions.auth.user().onCreate((user:any) => {
  return new Promise((resolve, reject) => {
    db.ref(`/users/${user.uid}`).set({
      "admin": false,
      "displayName": user.displayName,
      "email": user.email
    }).then(() => {
      resolve("success");
    }).catch((err:any) => {
      console.log(`Error creating user: ${err}`);
      resolve("!! Error creating user profile.")
    });
  });
});


export const validateUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snapshot:any) => {
      const val = snapshot.val()
      if (!Object.keys(val.users).includes(context.auth.token.user_id)){
        // user is missing profile
        resolve([false, val.config])
        const payload = {
          admin: false,
          displayName: context.auth.token.name,
          email: context.auth.token.email
        };
        db.ref(`/users/${context.auth.token.user_id}`).set(payload).then(() => {
          console.log(`Fixed invalid user ${context.auth.token.email}.`);
        }).catch((err:any) => {
          console.log(`Failed to fix invalid user ${context.auth.token.email} due to ${err}.`);
        });
      } else{
        resolve([val.users[context.auth.token.user_id].admin, val.config]);
      }
      admin.auth().getUserByEmail(serviceAccount.project_owner_email).then((userRecord:any) => {
        db.ref(`/users/${userRecord.uid}/admin`).set(true);
      });
    });
  });
});


export const getConfig = functions.https.onCall(() => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snap:any) => {
      const val = snap.val();
      resolve([val.config,]);
    }).catch(() => {
      resolve([{
        msg: "!! Internal Error"
      }]);
    });
  });
});


export const deregisterUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/users").once("value").then((snapshot: any) => {
      if (snapshot.val()[data.targetUid].email === serviceAccount.project_owner_email){
        resolve("!! Cannot delete project owner.")
      } else{
        if ((snapshot.val()[context.auth.uid].admin === true) || (context.auth.uid === data.targetUid)){
          const p_delUser = admin.auth().deleteUser(data.targetUid);
          const p_delUserInfo = db.ref(`/users/${data.targetUid}`).set(null);
          Promise.all([p_delUser, p_delUserInfo]).then(() => {
            resolve("success");
          }).catch((err: any) => {
            console.log(`Error in deleting user ${snapshot.val()[data.targetUid].email} by ${context.auth.email}: ${err}`);
            resolve("!! Failed to delete user.");
          });
        } else{
          console.log(`Failed attempt to delete ${snapshot.val()[data.targetUid].email} by ${context.auth.email}.`);
          resolve("!! Inadequate permissions.");
        }
      }
    }).catch(() => {
      resolve("!! Internal error.");
    });
  });
});


export const fetchCandidatesList = functions.https.onCall((data:any) => {
  return new Promise((resolve, reject) => {
    if (data.length !== 1){
      resolve({msg: "fail", errMsg: "!! Invalid format"});
    } else{
      db.ref("/").once("value").then((snapshot: any) => {
        if (snapshot.val().config.accepting === true){
          if (Object.keys(snapshot.val().ballots).includes(data[0])){
            const testLoc = snapshot.val().ballots[data[0]].test;
            const canList = snapshot.val()[testLoc].candidates;
            resolve({msg: "success", people: canList});
          } else{
            resolve({msg: "fail", errMsg: "!! Bad codeword"});
          }
        } else{
          resolve({msg: "fail", errMsg: "!! Not accepting responses"});
        }
      }).catch((err:any) => {
        console.log(`Failed to read data candidates list with codeword ${data[0]} due to ${err}.`)
        resolve({msg: "fail", errMsg: "!! Internal error"});
      });
    }
  });
});


export const registerBallot = functions.https.onCall((data:any) => {
  return new Promise((resolve, reject) => {
    db.ref("/").once("value").then((snapshot:any) => {
      if (snapshot.val().config.accepting === true){
        if (Object.keys(snapshot.val().ballots).includes(data[0])){
          if (data[1].trim === ""){
            resolve("!! Invalid Ballot");
            return;
          }
          for (let ballotIndex=0; ballotIndex<snapshot.val().config.rankNumCandidates; ballotIndex++){
            if ((ballotIndex<snapshot.val().config.minRankCandidates) && (data[ballotIndex+1].trim() === "")){
              resolve("!! Invalid Ballot.");
              return;
            }
            if (ballotIndex !== 0){
              if ((data[ballotIndex+1].trim() !== "") && (data[ballotIndex].trim() === "")){
                resolve("!! Invalid Ballot.");
                return;
              }
            }
          }
          if (Object.keys(snapshot.val()).includes(snapshot.val().ballots[data[0]].test)){
            const payload = Array();
            for (let canIndex=0; canIndex<snapshot.val().config.rankNumCandidates; canIndex++){
              if (data[canIndex+1].trim() !== ""){
                if (Object.keys(snapshot.val()[snapshot.val().ballots[data[0]].test].candidates).includes(data[canIndex+1])){
                  payload.push([data[canIndex+1], snapshot.val()[snapshot.val().ballots[data[0]].test].candidates[data[canIndex+1]]]);
                } else{
                  resolve("!! Illegal ballot");
                  return;
                }
              }
            }
            db.ref(`/ballots/${data[0]}`).update({
              "vote": payload,
              "lastTime": `${new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"})} (AEST)`
            }).then(() => {
              resolve("success");
              return;
            }).catch((err:any) => {
              console.log(`Error registering ballot ${data}: ${err}`);
              resolve("!! Failed register ballot");
              return;
            });
          } else{
            console.log(`Error registering ballot ${data} due to failed challenge`);
            resolve("!! Internal error");
            return;
          }
        } else{
          resolve("!! Invalid codeword");
          return;
        }
      } else{
        resolve("!! Not accepting responses");
        return;
      }
    }).catch((err:any) => {
      console.log(`Error reading root by ${data}: ${err}`);
      resolve("!! Internal error");
      return;
    });
  });
});
