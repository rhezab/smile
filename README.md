# 🫠 Smile.

A happy approach to online research.

Online docs: [https://smile.gureckislab.org](https://smile.gureckislab.org)

## Required software to work on this

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)
- [Node.js](https://nodejs.org/en/download/)
- A git client (VS Code built in works!)
- The [GitHub command line tool](https://cli.github.com)

## rtdb_multiplayer branch changelog 
- in `stores/firestore-db.js`, add lines commented "for rtdb". This allows us to use rtdb in other files.
- added `multi-player.js`
    - includes the `WaitRoom` object for matching players (from `matching.js` in `dyadic-learning-trap-task`, branch `v3`)
    - also includes the stuff from `user.js` in `dyadic-learning-trap-task`, branch `v3`


## proposed matching logic
- have a list of unmatched players in rtdb
- for new player, if list is empty, add self to list. else, try to match with first person on the list that isn't currently in the proces of pairing.
- while pairing, make sure to check that proposed partner's partner is me
- use transactions to avoid collisions? if things change during proposal, move on to proposing to someone else