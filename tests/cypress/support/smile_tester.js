export function randomize_window_size(n_times, sleep) {
  // trigger a blur event
  for (let n = 0; n < n_times; n++) {
    const height = Math.floor(Math.random() * (1200 - 500 + 1)) + 500
    cy.viewport(1000, height)
    cy.wait(sleep)
  }
}

export function check_and_click_welcome(wait_speed) {
  cy.get('.title').should('contain', 'Please help us')
  // click the i'm ready button
  cy.wait(wait_speed)
  cy.contains("I'm ready!").click()
}

export function check_and_click_consent(wait_speed) {
  // consent form is loaded
  cy.get('h1').should('contain', 'Informed Consent Statement')
  cy.get("input[name='consent_toggle']").check({ force: true })
  cy.wait(wait_speed)
  cy.contains("Let's start").click()
}

export function check_and_click_demographic_survey(wait_speed) {
  // first page
  cy.url().should('include', '/demograph') // should go to demographic survey next
  // select dob
  cy.get('[name="dob"]').type('1990-01-01')
  // select gender
  cy.get('[name=gender]').select('Male')
  // select race
  cy.get('[name=race]').select('Asian')
  // select hispanic
  cy.get('[name=hispanic]').select('No')
  // select fluent
  cy.get('[name=english]').select('Yes')
  // click button
  cy.contains('Continue').click()

  // next page
  cy.get('[name=vision').select('Yes')
  cy.get('[name=colorblind').select('Yes')
  cy.get('[name=learningdisability').select('Yes')
  cy.get('[name=neurodevelopmentaldisorder').select('Yes')
  cy.get('[name=psychiatricdisorder').select('Yes')
  cy.contains('Continue').click()
  cy.get('[name=country]').select('United States')
  cy.get('[name=zipcode]').type('12345')
  cy.get('[name=education]').select('Secondary Education (ie. GED/GCSE)')
  cy.get('[name=income]').select('Less than $20,000')
  cy.wait(wait_speed)
  cy.contains('That was easy!').click()
}

export function check_and_click_window_resizer(wait_speed) {
  randomize_window_size(1, 10)
  cy.wait(wait_speed)
  cy.contains('It is visible now').click()
}

export function check_and_click_captcha(wait_speed) {
  cy.contains("I'm ready").click()
  cy.contains("I'm ready").click()
  cy.contains("I'm ready").click()
  cy.contains("I'm ready").click()
  cy.contains("I'm ready").click()
}

export function check_and_click_instructions(wait_speed) {
  cy.wait(wait_speed)
  cy.contains('next').click()
}

export function check_and_click_experiment(wait_speed) {
  cy.wait(wait_speed)
  cy.contains('next').click()
  cy.wait(wait_speed)
  cy.contains('next').click()
  cy.wait(wait_speed)
  cy.contains('next').click()
}

export function check_and_click_debrief(wait_speed) {
  cy.wait(wait_speed)
  cy.contains('next').click()
}
