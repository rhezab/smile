<script setup>
import useSmileAPI from '@/core/composables/smileapi'
const api = useSmileAPI()

function finish() {
  // smilestore.saveData()
  api.stepNextRoute()
}

api.smilestore.setRTDB()
console.log('rtdb_path: ', api.local.rtdb_path)
console.log('rtdb: ', api.local.rtdb)
</script>

<template>
  <div class="page  prevent-select">
    <h1 class="title is-3">RTDB Test Page</h1>
    <hr />
    <button class="button is-success is-light" id="finish" @click="finish()">
      next &nbsp;
      <FAIcon icon="fa-solid fa-arrow-right" />
    </button>
  </div>
</template>
