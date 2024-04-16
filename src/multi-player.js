// imports from matching.js
import { v4 as uuid } from "uuid";
// import {user} from '@/user.js';
// import { size } from "@/utils.js";

import {
  set,
  get,
  child,
  ref as rtref,
  remove,
  serverTimestamp,
  onDisconnect,
  onValue,
  update,
} from "firebase/database";

import {
    useDB,
    rtdb,
    rtdb_path
} from '@/stores/firestore-db'

import useSmileStore from '@/stores/smiledata' // get access to the global store

function size(obj) {
    /* gets the size of an object */ 
    if (!obj) return 0;
    return Object.keys(obj).length;
}

// initialize user
export const user = {
    id: null,
    name: null,
    seedID: null,
    paired: false,
    partner: null,
    partnerName: null,
    partnerSeedID: null,
    gameType: null,
    // conds: null,
    db: null,
    rtdb: null,
    playersRef: null,
    meRef: null,
    requestsRef: null,
    responsesRef: null,
    requestFrom: [],
    waitAnswer: false,
    sessionsRef: null,
    session: null,
    thisSessionRef: null,
  };

export const initUser = () => {
    // use smilestore
    const smilestore = useSmileStore()
    const study_id = smilestore.getRecruitmentStudy_id();
    
    // set variables
    user.id = smilestore.getDocID();
    user.name = user.id.substring(2,5);
    user.seedID = smilestore.getSeedID
    // user.conds = smilestore.getConds();
    user.db = useDB;
    user.rtdb = rtdb; 
    user.playersRef = rtref(user.rtdb, rtdb_path + "players/" + study_id + "/"); // create reference to rtdb at path players/study_id/
    user.meRef = rtref(user.rtdb, rtdb_path + "players/" + study_id + "/" + user.id);
    user.requestsRef = rtref(user.rtdb, rtdb_path + "requests/" + study_id + "/");
    user.responsesRef = rtref(user.rtdb, rtdb_path + "responses/" + study_id + "/");
    user.sessionsRef = rtref(user.rtdb, rtdb_path + "sessions/" + study_id + "/");
};

export const resetUser = (user) => {
    // When want to play again
    // user.name = null; // commented this out bc it resets user name
    user.paired = false;
    user.partner = null;
    user.partnerName = null;
    user.partnerSeedID = null;
    user.waitAnswer = false;
    user.requestFrom = [];
    user.session = null;
};

export default class WaitRoom {
    constructor() {
        // init stuff
        this.smilestore = useSmileStore()
        this.user = user
        this.study_id = this.smilestore.getRecruitmentStudy_id()
    }

    async init(gameMode) { // gameMode 2 for duo, gameMode 1 for solo
        // init stuff
        if (gameMode === 2) {
            // Set wait timeout
            this.timeout = setInterval(() => { // built-in method that does this every interval
              this.smilestore.local.waitingRoomTimeoutCounter -= 1000
              if (this.smilestore.local.waitingRoomTimeoutCounter < 1000) {
                // too much time has passed.
                clearInterval(this.timeout);

                // solo play
                this.user.paired = true // block future pairing
                this.user.partner = 'none'
                this.user.partnerName = 'none'
                this.user.partnerSeedID = 'none'
                // this.user.gameType = "solo"
                this.user.partner_found = false
                this.user.session = this._makeSession(this.user.id, this.user.id)

                update(this.user.meRef, {
                    status: "play",
                    partner: this.user.partner,
                    partnerName: this.user.partnerName,
                    partnerSeedID: this.user.partnerSeedID,
                    // gameType: this.user.gameType,
                    partner_found: this.user.partner_found,
                    session: this.user.session
                })

                this.user.thisSessionRef = rtref(this.user.rtdb, rtdb_path + "sessions/" + this.study_id + "/" + this.user.session);
                set(this.user.thisSessionRef, {
                    _gameMode: "single",
                    _appMode: this.smilestore.getMode(),
                    _recruitment: this.smilestore.getRecruitment_service(),
                    _player: this.user.id,
                    _timestamp: new Date().getTime(),
                    _status: "ongoing",
                });

                // Give user info to smilestore
                this.smilestore.saveUserData({
                    playerId: this.user.id,
                    playerName: this.user.name,
                    playerSeedID: this.user.seedID,
                    joinAt: new Date().getTime(),
                    // conds: user.conds,
                    status: "play",
                    partner: this.user.partner,
                    partnerName: this.user.partnerName,
                    partnerSeedID: this.user.partnerSeedID,
                    // gameType: this.user.gameType,
                    partner_found: this.user.partner_found,
                    session: this.user.session
                })

                // save game type to conditions
                // this.smilestore.setCondition('gameType', this.user.gameType)

                // end the study early and send them partial compensation
                // rm from rtdb, send to thanks page
                // if (user.meRef) remove(user.meRef);
                // this.nopair_endtask();
       
              }
            }, 1000);
      
            // Tell everyone I'm here
            /**
             * players: {
             *  id: {
             *    playerId
             *    joinAt
             *    status // wait, play
             *    partner
             *  }
             * }
             */
             // Also, Let RTDB know the condition object they have been assigned
            set(this.user.meRef, { // remember that meRef is reference for my player
              playerId: this.user.id,
              playerName: this.user.name,
              playerSeedID: this.user.seedID,
              joinAt: new Date().getTime(),//serverTimestamp(),
              // conds: user.conds,
              status: "wait",
              recruitment: this.smilestore.getRecruitment_service(),
              partner: "",
              partnerName: "",
              partnerSeedID: "",
              gameType: "",
              session: "",
            }).then(() => {
              // Remove myself when disconnect
              onDisconnect(this.user.meRef).remove();
      
              // ! Listen to all changes
              onValue(this.user.playersRef, (snap) => { // snap is snapshot of data at the ref
                // snap contains all online players
                if (!this.user.paired) {
                  const filteredSnap = this.filterSnap(snap.val()); // filter list of online players
                  this.tryPair(filteredSnap, this.study_id); // try to make a pair with one of them
                } else {
                    /* left over from pamop */
                    // Already paired, check if my partner is still there
                    // If not, switch the status back to wait
                    // TODO
                }
              });
      
              // check new requests (attempts at pairs) to make an actual pair
              onValue(this.user.requestsRef, (snap) => {
                const requests = snap.val();
      
                // TODO: filter so only prolific ppl can play with other prolific ppl, web with web, etc
                for (let requestId in requests) {
                  if (
                    requests[requestId].to === this.user.id &&
                    !this.user.requestFrom.includes(requests[requestId].from)
                  ) {
                    // moving from request to response
                    this.user.requestFrom.push(requests[requestId].from);
                    remove(rtref(this.user.rtdb, rtdb_path + "requests/" + this.study_id + "/" + requestId));
                    set(rtref(this.user.rtdb, rtdb_path + "responses/" + this.study_id + "/" + uuid()), {
                      from: this.user.id,
                      fromName: this.user.name,
                      fromSeedID: this.user.seedID,
                      to: requests[requestId].from,
                      response: !this.user.paired,
                    });
                    // Mark self as paired once response yes to someone
                    if (!this.user.paired) {
                      this.user_makePair(
                        requests[requestId].from,
                        requests[requestId].fromName,
                        requests[requestId].fromSeedID
                      );
                    }
                  } else if (requests[requestId].to === this.user.id) {
                    remove(rtref(this.user.rtdb, rtdb_path + "requests/" + this.study_id + "/" + requestId));
                  }
                }
              });
     
              // check responses to requests
              onValue(this.user.responsesRef, (snap) => {
                const responses = snap.val();
      
                for (let responseId in responses) {
                  if (responses[responseId].to === this.user.id && this.user.waitAnswer) {
                    this.user.waitAnswer = false;
                    // user.responseFrom.push(responses[responseId].from);
                    remove(rtref(this.user.rtdb, rtdb_path + "responses/" + this.study_id + "/" + responseId));
                    if (responses[responseId].response && !this.user.paired) {
                      // Answer is yes (true)
                      // ! Actual pairing
                      this.user_makePair(
                        responses[responseId].from,
                        responses[responseId].fromName,
                        responses[responseId].fromSeedID
                      );
                    }
                  }
                }
              });
            });
          } else if (gameMode === 1) {
            // Single player
            this.start_singlePlayer();
          }
    }

    nopair_endtask() {    
        // end task and ask them to return hit
        this.user.session = uuid();
    
        // Give user info to smilestore for reference
        this.smilestore.saveUserData({
            playerId: this.user.id,
            playerName: this.user.name,
            joinAt: new Date().getTime(),//serverTimestamp(),
            // conds: user.conds,
            status: "endEarly",
            partner: "NONE",
            partnerName: "NONE",
            session: this.user.session,
        })
    
        /* 
        setTimeout(() => {
            console.log('timeout')
        }, 500);
        */
    }

    start_singlePlayer() {
        // play with AI
        // no need to wait, register ids and jump into the game
        this.user.session = uuid();
    
        // Give user info to smilestore
        this.smilestore.saveUserData({
            playerId: this.user.id,
            playerName: this.user.name,
            joinAt: new Date().getTime(),//serverTimestamp(),
            // conds: user.conds,
            status: "play",
            partner: "COMPUTER",
            partnerName: "COMPUTER",
            session: this.user.session,
        })
        set(this.user.meRef, {
            playerId: this.user.id,
            playerName: this.user.name,
            joinAt: new Date().getTime(),//serverTimestamp(),
            // conds: user.conds,
            status: "play",
            recruitment: this.smilestore.getRecruitment_service(),
            partner: "COMPUTER",
            partnerName: "COMPUTER",
            session: this.user.session,
        }).then(() => {
            onDisconnect(this.user.meRef).remove();
        });
    
        this.user.thisSessionRef = rtref(this.user.rtdb, rtdb_path + "sessions/" + this.study_id + "/" + this.user.session);
        set(this.user.thisSessionRef, {
            _gameMode: "single",
            _appMode: this.smilestore.getMode(),
            _recruitment: this.smilestore.getRecruitment_service(),
            _player: this.user.id,
            _timestamp: new Date().getTime(),
            _status: "ongoing",
        });
    
        setTimeout(() => {
            // console.log('timeout')
            // console.log(this);
            // There is only one player, so we use their condition object.
            this.smilestore.assignConds(this.user.session)
        }, 2000);
    }

    user_makePair(partner, partnerName, partnerSeedID) {
        this.user.paired = true; // Block all future pairing
        this.user.partner = partner;
        this.user.partnerName = partnerName
        this.user.partnerSeedID = partnerSeedID
        // this.user.gameType = "duo"
        this.user.partner_found = true
        this.user.session = this._makeSession(this.user.id, this.user.partner);

        update(this.user.meRef, {
            status: "play",
            partner: partner,
            partnerName: partnerName,
            partnerSeedID: partnerSeedID,
            // gameType: this.user.gameType,
            partner_found: this.user.partner_found,
            session: this.user.session,
        });
        
        this.user.thisSessionRef = rtref(this.user.rtdb, rtdb_path +  "sessions/" + this.study_id + "/" + this.user.session);
        set(this.user.thisSessionRef, {
          _gameMode: "double",
          _appMode: this.smilestore.getMode(), // undefined
          _recruitment: this.smilestore.getRecruitment_service(),
          _playerA: this._biggerIdFirst(this.user.id, this.user.partner)
            ? this.user.id
            : this.user.partner,
          _playerB: this._biggerIdFirst(this.user.id, this.user.partner)
            ? this.user.partner
            : this.user.id,
          _timestamp: new Date().getTime(),
          _status: "ongoing",
        });
    
        // Give user info to smilestore
        this.smilestore.saveUserData({
          playerId: this.user.id,
          playerName: this.user.name,
          playerSeedID: this.user.seedID,
          joinAt: new Date().getTime(),
          // conds: user.conds,
          status: "play",
          partner: partner,
          partnerName: partnerName,
          partnerSeedID: partnerSeedID,
          // gameType: this.user.gameType,
          partner_found: this.user.partner_found,
          session: this.user.session,
        })

        // save game type to conditions
        // this.smilestore.setCondition('gameType', this.user.gameType)
    
        clearInterval(this.timeout);
        /*
        setTimeout(() => {
          console.log('timeout');
        }, 2000);
        */
    }

    _makeSession(thisId, partnerId) {
        if (thisId == partnerId) {
            return thisId.slice(0, 7) + partnerId.slice(0, 7);
        } else {
            if (this._biggerIdFirst(thisId, partnerId))
                return thisId.slice(0, 7) + partnerId.slice(0, 7);
            else return partnerId.slice(0, 7) + thisId.slice(0, 7);
        }
    }

    _biggerIdFirst(a, b) {
        if (a[0] > b[0]) return true;
        else if (a[0] < b[0]) return false;
        else return this._biggerIdFirst(a.slice(1), b.slice(1));
    }

    filterSnap(snap) {
        const filtered = {};
        for (let s in snap) {
            if (s !== this.user.id && snap[s].status === "wait") {
                filtered[s] = { ...snap[s] };
            }
        }
        return filtered;
    };

    tryPair(availablePlayers, study_id) {
        if (size(availablePlayers) !== 0 && !this.user.waitAnswer) {
            // Make a pairing request
            this.user.waitAnswer = true;
            // let trypartner = getFirstJoin(availablePlayers);
            set(rtref(this.user.rtdb, rtdb_path +  "requests/" + study_id + "/" + uuid()), {
                from: this.user.id,
                fromName: this.user.name,
                fromSeedID: this.user.seedID,
                to: this.getFirstJoin(availablePlayers),
                // toConds: availablePlayers[trypartner].conds
            });
        }
        return;
    }

    getFirstJoin(players) {
        let minJoin = Infinity;
        let minKey = "";
        for (let id in players) {
        if (players[id].joinAt < minJoin) {
            minJoin = players[id].joinAt;
            minKey = id;
        }
        }
        return minKey;
    }
    
}