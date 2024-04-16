<script setup>
import { useRouter, useRoute } from 'vue-router'
import useTimelineStepper from '@/composables/timelinestepper'
import useSmileStore from '@/stores/smiledata' // get access to the global store

const router = useRouter()
const route = useRoute()
const smilestore = useSmileStore()

const { next, prev } = useTimelineStepper()

if (route.meta.progress) smilestore.global.progress = route.meta.progress

function finish(goto) {
  // smilestore.saveData()
  if (goto) router.push(goto)
}

// matching stuff
import {
    useDB,
    rtdb,
    rtdb_path
  } from '@/stores/firestore-db'
import {
    ref as rtref
  } from 'firebase/database'
import { ref, onMounted, onUnmounted, watch } from 'vue';

const partnerFound = ref(false)

// create pool of players looking for partners
// basically want to get partner's id, and send my id to partner
// if send request, pause and wait for answer - don't check requests
// each user 

const user = {
    id: smilestore.getDocID(),
    partnerId: null,
    paired: false,
    pairing: false // mark true when there has been a proposed match and we need to check it 
}

const playersRef = rtref(user.rtdb, rtdb_path + "players/" + study_id + "/");
const meRef = push(playersRef, user.id) // rtref(user.rtdb, rtdb_path + "players/" + study_id + "/" + user.id);

// if pool is empty, then add self to pool
// if pool non-empty, send request to first player in pool that is not currently pairing

</script>

<template>
    <h1 class="title is-3">Hello world.</h1>
</template>