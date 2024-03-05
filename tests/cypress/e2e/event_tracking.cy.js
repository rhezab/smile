import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  getDoc,
  Timestamp,
  runTransaction,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import * as st from '../support/smile_tester'
// write a cypress test to check that certain data was written into Firestore
// this is a test file for checking the cloud research workflow
const wait_speed = 2500

describe('test browser event tracking works properly', () => {
  // this method is called once before all tests
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  //   // visit the actual Smile experiment page
  //   cy.visit(`${Cypress.env('VITE_DEPLOY_URL')}`)
  //   cy.viewport(1000, 1200) // set the viewport
  //   // emulator running `firebase emulators:start`
  //   // cy.origin('http://127.0.0.1:4000', { testIsolation: true }, () => {
  //   //   cy.visit(`http://127.0.0.1:4000/firestore/data`) // dev mode allows jumping paths like thi
  //   //   cy.get('.AppBar-title').should('contain', 'Firebase')
  //   // })
  //   // if this fails it means the dev server isn't running
  //   // in testing mode.  to do this you need to run
  //   // `npm run dev:test` and
  //   cy.visit(`/`)
  //   cy.get('.studyinfo').should('contain', '-testing')

  //   // you also need to have the firebase

  //   // go back to experiment
  //   // cy.visit(`${Cypress.env('VITE_DEPLOY_URL')}`)
  // })

  it('should create a firebase document after the consent form submitted', () => {
    // first page is loaded
    cy.visit(`${Cypress.env('VITE_DEPLOY_URL')}/`)
    cy.viewport(1000, 1200) // set the viewport

    // click welcome screen
    st.check_and_click_welcome(wait_speed)

    // agree to consent form
    st.check_and_click_consent(wait_speed)

    // should show up as known user
    // cy.getAllLocalStorage().then((result) => {
    //   console.log('localstorage result', result)
    //   expect(result).to.deep.equal({
    //     'smilestore-wear-industrious-quiet': {
    //       knownUser: 'true',
    //     },
    //   })
    // })

    // demographic page
    st.check_and_click_demographic_survey(wait_speed)
    // resize window
    st.check_and_click_window_resizer(wait_speed)
    // pass through captcha
    st.check_and_click_captcha(wait_speed)
    // pass through instructions
    st.check_and_click_instructions(wait_speed)
    // pass through experiment
    st.check_and_click_experiment(wait_speed)
    // pass through debrief
    st.check_and_click_debrief(wait_speed)

    cy.get('h1').contains('Thanks for your contribution to science!')
  })
})
