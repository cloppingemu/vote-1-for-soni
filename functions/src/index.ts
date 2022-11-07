import {serviceAccount, projectOwnerEmail, projectOwnerName} from "./keys";
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.projectId}-default-rtdb.firebaseio.com`,
});
const db = admin.database();

const doAppEnforce = true;

export const registerUser = functions.auth.user().onCreate((user:any) => {
  return new Promise((resolve) => {
    db.ref(`/users/${user.uid}`).set({
      "admin": false,
      "displayName": user.displayName,
      "email": user.email,
    }).then(() => {
      resolve({
        msg: "success",
      });
    }).catch((err:any) => {
      console.log(`Error creating user: ${err}`);
      resolve({
        msg: "!! Error creating user profile.",
      });
    });
  });
});


export const getConfig = functions.https.onCall(() => {
  return new Promise((resolve) => {
    db.ref("/config").once("value").then((snap:any) => {
      const val = snap.val();
      resolve({
        msg: "success",
        config: val,
      });
    }).catch(() => {
      resolve({
        msg: "!! Internal Error",
      });
    });
  });
});


export const deregisterUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve) => {
    if (context.app == undefined && doAppEnforce) {
      resolve("!! App not used");
    } else {
      db.ref("/users").once("value").then((snapshot: any) => {
        if (snapshot.val()[data.targetUid].email === projectOwnerEmail) {
          resolve({msg: "!! Cannot delete project owner"});
        } else {
          if ((snapshot.val()[context.auth.uid].admin === true) || (context.auth.uid === data.targetUid)) {
            const promiseDelUser = admin.auth().deleteUser(data.targetUid);
            const promiseDelUserInfo = db.ref(`/users/${data.targetUid}`).set(null);
            Promise.all([promiseDelUser, promiseDelUserInfo]).then(() => {
              resolve({msg: "success"});
            }).catch((err: any) => {
              console.log(`Error deleting user ${snapshot.val()[data.targetUid].email} by ${context.auth.email}: ${err}`);
              resolve({msg: "!! Failed to delete user"});
            });
          } else {
            console.log(`Failed attempt to delete ${snapshot.val()[data.targetUid].email} by ${context.auth.email}.`);
            resolve({msg: "!! Inadequate permissions"});
          }
        }
      }).catch(() => {
        resolve({msg: "!! Internal error."});
      });
    }
  });
});


export const validateUser = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve) => {
    if (context.app == undefined && doAppEnforce) {
      resolve("!! App not used");
    } else {
      db.ref("/").once("value").then((snapshot:any) => {
        const val = snapshot.val();
        if (!Object.keys(val.users).includes(context.auth.token.user_id)) {
          // user is missing profile
          resolve({admin: false});
          const payload = {
            admin: false,
            displayName: context.auth.token.name,
            email: context.auth.token.email,
          };
          db.ref(`/users/${context.auth.token.user_id}`).set(payload).then(() => {
            console.log(`Fixed invalid user ${context.auth.token.email}.`);
          }).catch((err:any) => {
            console.log(`Failed to fix invalid user ${context.auth.token.email} due to ${err}.`);
          });
        } else {
          resolve({admin: val.users[context.auth.token.user_id].admin});
        }
        admin.auth().getUserByEmail(projectOwnerEmail).then((userRecord:any) => {
          db.ref(`/users/${userRecord.uid}`).set({
            admin: true,
            displayName: projectOwnerName,
            email: projectOwnerEmail,
          }).catch(() => {
            resolve({msg: "!! Internal error."});
          });
        }).catch(() => {
          resolve({msg: "!! Internal error."});
        });
      });
    }
  });
});


export const fetchCandidatesList = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve) => {
    if (context.app == undefined && doAppEnforce) {
      resolve("!! App not used");
    } else {
      if (data.length !== 1) {
        resolve({msg: "!! Invalid format"});
      } else {
        db.ref("/").once("value").then((snapshot: any) => {
          if (snapshot.val().config.accepting === true) {
            if (Object.keys(snapshot.val().ballots).includes(data[0])) {
              const canList = snapshot.val().candidates;
              resolve({
                msg: "success",
                people: canList,
                hash: snapshot.val().ballots[data[0]].hash,
              });
            } else {
              resolve({msg: "!! Bad codeword"});
            }
          } else {
            resolve({msg: "!! Not currently accepting responses"});
          }
        }).catch((err:any) => {
          console.log(`Failed to read data candidates list with codeword ${data[0]} due to ${err}.`);
          resolve({msg: "!! Internal error"});
        });
      }
    }
  });
});


export const registerBallot = functions.https.onCall((data:any, context: any) => {
  return new Promise((resolve) => {
    if (context.app == undefined && doAppEnforce) {
      resolve("!! App not used");
    } else {
      db.ref("/").once("value").then((snapshot:any) => {
        const snap = snapshot.val();
        if (snap.config.accepting == true) {
          if (Object.keys(snap.ballots).includes(data[0].toLowerCase())) {
            for (let ballotIndex = 0; ballotIndex < snap.config.rankNumCandidates; ballotIndex++) {
              if (ballotIndex < snap.config.minRankCandidates && data[ballotIndex+1].trim() == "") {
                resolve("!! Invalid Ballot");
                return;
              }
              if (ballotIndex != 0) {
                if (data[ballotIndex+1].trim() != "" && data[ballotIndex].trim() == "") {
                  resolve("!! Invalid Ballot");
                  return;
                }
              }
            }
            const payload = [];
            for (let canIndex = 0; canIndex < snap.config.rankNumCandidates; canIndex++) {
              if (data[canIndex+1].trim() != "") {
                if (Object.keys(snap.candidates).includes(data[canIndex+1])) {
                  payload.push(data[canIndex+1]);
                } else {
                  resolve("!! Invalid ballot");
                  return;
                }
              }
            }
            db.ref(`/ballots/${data[0].toLowerCase()}`).update({
              "vote": payload,
              "lastTime": `${new Date().toLocaleString("en-AU", {timeZone: "Australia/Sydney"})} (AEST)`,
            }).then(() => {
              resolve("success");
              return;
            }).catch((err:any) => {
              console.log(`Error registering ballot ${data}: ${err}`);
              resolve("!! Failed register ballot");
              return;
            });
          } else {
            resolve("!! Invalid codeword");
            return;
          }
        } else {
          resolve("!! Not accepting responses");
          return;
        }
      }).catch((err:any) => {
        console.log(`Error reading root by ${data}: ${err}`);
        resolve("!! Internal error");
        return;
      });
    }
  });
});


export const fetchCandidatesListByHash = functions.https.onCall((data:any, context:any) => {
  return new Promise((resolve) => {
    if (context.app == undefined && doAppEnforce) {
      resolve({msg: "!! App not used"});
    } else {
      if (data.length === 1 && data[0].length === 36) {
        db.ref("/").once("value").then((snapshot:any) => {
          const snap = snapshot.val();
          if (snap.config.accepting) {
            const matches = Object.keys(snap.ballots).filter((word:any) => {
              return snap.ballots[word].hash == data[0];
            });
            if (matches.length === 1) {
              const canList = snap.candidates;
              resolve({
                msg: "success",
                codeword: matches[0],
                people: canList,
              });
            } else if (matches.length > 1) {
              console.log(`Hash collision; ${data[0]}: ${matches}`);
              resolve({msg: "!! Invalid ballot"});
            } else {
              resolve({msg: "!! Invalid ballot"});
            }
          } else {
            resolve({msg: "!! Not currently accepting responses"});
          }
        }).catch(() => {
          resolve({msg: "!! Internal error"});
        });
      } else {
        resolve({msg: "!! Invalid ballot"});
      }
    }
  });
});
