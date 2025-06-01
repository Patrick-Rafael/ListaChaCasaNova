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
const colectionName = "listaChaCasaNova";
const pixSuggestionCollection = "pixSugestoes";

// FUNÇÕES FIREBASE

async function updatePresent(name, isPromised, promisedBy) {
  const snapshot = await db
    .collection(colectionName)
    .where("name", "==", name) // Filtra pelo campo "name"
    .get();

  if (snapshot.empty) {
    console.error("Nenhum presente encontrado com esse nome.");
    return;
  }

  const docRef = snapshot.docs[0].ref;
  await docRef
    .update({
      isPromised: isPromised,
      promisedBy: promisedBy,
    })
    .catch((error) => console.error("Erro ao atualizar presente: ", error));
}

async function getPresents(isPromised, isPix = null) {
  let presents = [];
  let query = db
    .collection(colectionName)
    .where("isPromised", "==", isPromised);
  if (isPix != null) query = query.where("isPix", "==", isPix);
  await query
    .orderBy("createdAt", "asc")
    .get()
    .then((querySnapshot) => {
      if (!querySnapshot.empty)
        querySnapshot.forEach((doc) => presents.push(doc.data().name));
    })
    .catch((error) => console.error("Erro ao buscar presentes:", error));
  return presents;
}

async function addTravelHelp(amount, promisedBy = "") {
  db.collection("luaDeMel")
    .add({
      amount: amount,
      promisedBy: promisedBy,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((error) =>
      console.error("Erro ao adicionar valor para a lua de mel: ", error)
    );
}

async function getAmountTravelHelp() {
  let totalAmount = 0;
  await db
    .collection("luaDeMel")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let amountStr = doc.data().amount;
        let amount = parseFloat(amountStr.replace("R$", "").replace(",", "."));
        totalAmount += amount;
      });
    })
    .catch((error) =>
      console.error("Erro ao obter o total arrecadado: ", error)
    );
  return totalAmount.toFixed(2);
}

async function addPresent(name, isPix = false) {
  if (!name) return;
  await db
    .collection(colectionName)
    .add({
      name: name,
      isPix: isPix,
      isPromised: false,
      promisedBy: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((error) => console.error("Erro ao adicionar presente: ", error));
}

async function handleAddPresent() {
  const input = document.getElementById("newPresentInput");
  const isPix = document.getElementById("isPixCheckbox").checked;
  const name = input.value.trim();

  if (!name) {
    alert("Por favor, insira o nome do presente.");
    return;
  }

  await addPresent(name, isPix);
  input.value = "";
  document.getElementById("isPixCheckbox").checked = false;

  await setListValues(); // Atualiza as listas na tela
  alert("Presente adicionado com sucesso!");
}

// CÓDIGO PRINCIPAL

let pixList = [];
let availableList = [];
let promisedList = [];
let choosedPresent = [];
let travelHelp = "";
const TRAVEL_TOTAL_VALUE = 2600;
const PIX_KEY = "22998102001";

init();

async function init() {
  document.querySelectorAll(".pixKeyLabel").forEach((elemento) => {
    elemento.innerHTML = PIX_KEY;
  });

  await setListValues();
  listenEvents();
}

function listenEvents() {
  const checkboxes = document.querySelectorAll(".availablePresentCheck");
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (checkbox.checked) {
        choosedPresent.push(this.value);
      } else {
        const index = choosedPresent.indexOf(this.value);
        if (index !== -1) {
          choosedPresent.splice(index, 1);
        }
      }
    });
  });

  document
    .getElementById("choosePresentButton")
    .addEventListener("click", openPromissePresentModal);
  document.getElementById('pixKeyContainer').addEventListener('click', copyPixKey);
}

async function setListValues() {
  pixList = await getPixSuggestions(false, true);

  const pixListElement = document.getElementById("pixList");

  pixListElement.innerHTML = "";

  if (pixList.length > 0) {
    pixList.forEach((present) => {
      pixListElement.innerHTML += `
      <li>
        <input type="checkbox" value="${present.description}" id="${present.id}" class="availablePresentCheck">
        <label for="${present.id}">
          ${present.description} - R$ ${present.value}
        </label>
      </li>
    `;
    });
  } else {
    document.getElementById("pixList").innerHTML += `
    <p>Todas as sugestões de pix já foram escolhidas! 🎉🥳</p>
    <p>Mas fique à vontade pra nos ajudar com o que desejar.</p>
  `;
  }

  availableList = await getPresents(false, false);

  const availableListElement = document.getElementById("availableList");
  availableListElement.innerHTML = "";
  if (availableList.length > 0) {
    availableList.forEach((present) => {
      availableListElement.innerHTML += `
        <li>
          <input type="checkbox" value="${present}" id="${present}" class="availablePresentCheck">
          <label for="${present}">${present}</label>
        </li>
      `;
    });
  } else {
    document.getElementById("promisedList").innerHTML += `
      <p>Todos os presentes que sugerimos já foram escolhidos! 🎉🥳</p>
      <p>Mas fique à vontade pra nos ajudar com o que desejar.</p>
    `;
  }

  const promisedPresents = await getPresents(true, false);
  const promisedPix = await getPixSuggestions(true);

  promisedList = [
    ...promisedPresents,
    ...promisedPix.map((item) => `${item.description} - R$ ${item.value}`),
  ];

  const promisedListElement = document.getElementById("promisedList");
  promisedListElement.innerHTML = "";
  if (promisedList.length > 0) {
    promisedList.forEach((present) => {
      promisedListElement.innerHTML += `
        <li>
          <input type="checkbox" value="${present}" id="${present}" checked disabled>
          <label for="${present}">${present}</label>
        </li>
      `;
    });
  } else {
    promisedListElement.innerHTML += `
      <p>Ainda não temos nenhum presente... Você pode ser o primeiro!</p>
    `;
  }
}

async function openPromissePresentModal() {
  const checkboxes = document.querySelectorAll(
    ".availablePresentCheck:checked"
  );
  const travelHelpInput = document.getElementById("inputTravelHelp");
  const travelHelpText = travelHelpInput ? travelHelpInput.value : "";

  if (checkboxes.length > 0 || travelHelpText != "") {
    document.getElementById("promissePresentModal").style.display = "flex";
    const presentsListEl = document.getElementById("promissedPresent");
    presentsListEl.innerHTML = "";

    checkboxes.forEach((cb) => {
      presentsListEl.innerHTML += `<li><span class="icon"></span>${cb.value}</li>`;
    });

    if (travelHelpText != "") {
      let travelHelpFloat = parseFloat(
        travelHelpText.replace(/[^\d.-]/g, "").replace(",", ".")
      );
      let travelHelp = travelHelpFloat.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
      presentsListEl.innerHTML += `<li><span class="icon"></span>${travelHelp}</li>`;
    }
  } else {
    document.getElementById("errorModal").style.display = "flex";
  }
}

async function addGiftPromise(presentName, promisedBy) {
  await db
    .collection("presentesPrometidos")
    .add({
      name: presentName,
      promisedBy: promisedBy,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((error) => {
      console.error("Erro ao registrar promessa de presente: ", error);
    });
}

async function confirmPromissedPresent() {
  let promisedBy = document.getElementById("promissedByInput").value;

  if (!promisedBy) {
    alert("Por favor, insira seu nome.");
    return;
  }

  const checkboxes = document.querySelectorAll(
    ".availablePresentCheck:checked"
  );
  let formatetPresents = [];

  for (const checkbox of checkboxes) {
    const name = checkbox.value;

    // Verifica se é um item da lista de Pix
    const isPixItem = pixList.some((item) => item.description === name);
    if (isPixItem) {
      const pixItem = pixList.find((item) => item.description === name);
      await db.collection(pixSuggestionCollection).doc(pixItem.id).update({
        isPromised: true,
        promisedBy: promisedBy,
      });

      // ✅ Também registra o Pix prometido na coleção "presentesPrometidos"
      await addGiftPromise(
        `${pixItem.description} - R$ ${pixItem.value}`,
        promisedBy
      );

      formatetPresents.push(
        `💸 ${pixItem.description} - R$ ${pixItem.value}\n`
      );
    } else {
      await updatePresent(name, true, promisedBy);
      await addGiftPromise(name, promisedBy);
      formatetPresents.push(`🎁 ${name}\n`);
    }
  }

  try {
    await setListValues();
  } catch (err) {
    console.error("Erro em setListValues:", err);
  }

  document.getElementById("promissePresentModal").style.display = "none";
  document.getElementById("successModal").style.display = "flex";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function copyPixKey() {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard
      .writeText(PIX_KEY)
      .then(() => {
        alert("Chave Pix copiada!");
      })
      .catch((err) => {
        console.error("Erro ao copiar chave Pix:", err);
      });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = PIX_KEY;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      alert("Chave Pix copiada!");
    } catch (err) {
      console.error("Erro ao copiar chave Pix:", err);
    }
    document.body.removeChild(textArea);
  }
}

async function addPixSuggestion(description, value) {
  if (!description || !value) return;

  await db
    .collection(pixSuggestionCollection)
    .add({
      description: description,
      value: value,
      isPromised: false,
      promisedBy: "",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .catch((error) =>
      console.error("Erro ao adicionar sugestão de PIX: ", error)
    );
}

async function getPixSuggestions(isPromised = false) {
  let suggestions = [];
  await db
    .collection(pixSuggestionCollection)
    .where("isPromised", "==", isPromised)
    .orderBy("createdAt", "asc")
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        suggestions.push({ id: doc.id, ...doc.data() });
      });
    })
    .catch((error) => console.error("Erro ao obter sugestões de PIX: ", error));
  return suggestions;
}

async function handleAddPixSuggestion() {
  const descriptionInput = document.getElementById("newPixInput");
  const valueInput = document.getElementById("newPixValueInput");

  const description = descriptionInput.value.trim();
  const value = valueInput.value.trim();

  if (!description || !value) {
    alert("Por favor, preencha a descrição e o valor.");
    return;
  }

  await addPixSuggestion(description, value);
  descriptionInput.value = "";
  valueInput.value = "";

  alert("Sugestão de PIX adicionada com sucesso!");
  await renderPixSuggestionsList(); // Atualiza a lista na tela
}

async function renderPixSuggestionsList() {
  const list = await getPixSuggestions(false);
  const listElement = document.getElementById("pixList");
  listElement.innerHTML = "";

  if (list.length === 0) {
    listElement.innerHTML = `<p>Nenhuma sugestão de PIX disponível no momento.</p>`;
    return;
  }

  list.forEach((item) => {
    listElement.innerHTML += `
      <li>
        <strong>${item.description}</strong> - R$ ${item.value}
      </li>
    `;
  });
}
