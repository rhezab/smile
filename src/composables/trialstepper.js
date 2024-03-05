import { shuffle } from '@/core/randomization'
import { ref } from 'vue'

export default function useTrialStepper(trials, finishedCallback) {
  const index = ref(0)
  const n_trials = trials.length
  const trial = ref(trials[index.value])

  function nextTrial() {
    if (index.value < n_trials - 1) {
      index.value += 1
      trial.value = trials[index.value]
    } else {
      finishedCallback()
    }
  }

  function prevTrial() {
    if (index.value > 0) {
      index.value -= 1
      trial.value = trials[index.value]
    }
  }
  return { index, trial, nextTrial, prevTrial }
}
