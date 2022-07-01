import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
} from 'firebase/firestore'
import appconfig from '@/config'

let firebaseApp
let db

// create a collection

export const updateDoc = async (data, docref, appconfig) => {
  let mode = 'real'
  if (appconfig.mode === 'development') {
    mode = 'testing'
  }
  const firebaseApp = initializeApp(appconfig.firebaseConfig)
  const db = getFirestore(firebaseApp)
  try {
    await setDoc(
      doc(db, `${mode}/${appconfig.project_ref}/data/`, docref),
      data,
      {
        merge: true,
      }
    )
  } catch (e) {
    console.error('Error updating document', e)
    return null
  }
}

export const createDoc = async (data, appconfig) => {
  // const smileStore = useSmileStore() // get access to the global store
  const firebaseApp = initializeApp(appconfig.firebaseConfig)
  const db = getFirestore(firebaseApp)

  let mode = 'real'
  if (appconfig.mode === 'development') {
    mode = 'testing'
  }

  // const db_type = collection(db, mode) // or should this be collection?

  // first get mode (development or live)
  // next try to see if a document exists in that collection or not
  // if not create one with the name of the experiment
  // add code name to the document as well

  // setDoc - write if no exist, or replace if there is one at that name
  // updateDoc - only overwrite fields you specify by error if doesn't exist
  // setDoc(,,{merge: true}) - create if doesn't exist, or update if it does
  // each as async away or .then()
  // addDoc gives you a random reference
  // getDoc to read in with document snamshop
  //   async function readASingleDocument() {
  //     const mySnapshot = await getDoc(specialofthedata)
  //     if (mydoc.exists()) {  // if it exists
  //         const mydata = mydown.data() // method
  //     }
  // }

  try {
    const expRef = doc(db, mode, appconfig.project_ref)
    await setDoc(
      expRef,
      {
        project_name: appconfig.project_name,
        project_ref: appconfig.project_ref,
        code_name: appconfig.code_name,
        code_name_url: appconfig.code_name_url,
      },
      { merge: true }
    )
    console.log(
      'Document written with ID: ',
      `${mode}/${appconfig.project_ref}`
    )

    // Add a new document with a generated id.
    const docRef = await addDoc(
      collection(db, `${mode}/${appconfig.project_ref}/data`),
      data
    )
    console.log('Document written with ID: ', docRef.id)
    return docRef.id
  } catch (e) {
    console.error('Error adding document: ', e)
    return null
  }
}

// export default createDoc
export default db