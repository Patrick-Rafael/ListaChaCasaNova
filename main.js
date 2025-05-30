// CONFIGURAÇÕES FIREBASE

const firebaseConfig = {
  apiKey: "AIzaSyBoBtKC1eKyKMwsuKnGrccsqpYkF9fsvNc",
  authDomain: "listachacasanova.firebaseapp.com",
  projectId: "listachacasanova",
  storageBucket: "listachacasanova.firebasestorage.app",
  messagingSenderId: "560375405417",
  appId: "1:560375405417:web:127d8d033a0ff52621bbf8",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// FUNÇÕES FIREBASE

function addPresent(
  colectionName,
  name,
  isPix,
  isPromised = false,
  promisedBy = ""
) {
  db.collection(colectionName)
    .add({
      name: name,
      isPix: isPix,
      isPromised: isPromised,
      promisedBy: promisedBy,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((error) => console.error("Erro ao adicionar presente: ", error));
}

async function addDefaultPresents(colectionName, isPix) {
  const defaultPresentsList = window[colectionName];
  if (isPix) colectionName = "presentesCasamento";
  defaultPresentsList.forEach((presentName) =>
    addPresent(colectionName, presentName, isPix)
  );
}

async function addPresentsList(colectionName, presentList) {
  presentList.forEach((presentName) =>
    addPresent(colectionName, presentName, false)
  );
}
