// CONFIGURAÇÕES FIREBASE

const firebaseConfig = {
    apiKey: "AIzaSyCt09Sn0on20h4B9uByhU30Y04BQELdCqQ",
    authDomain: "listapresentescasamentojr.firebaseapp.com",
    projectId: "listapresentescasamentojr",
    storageBucket: "listapresentescasamentojr.firebasestorage.app",
    messagingSenderId: "986437344914",
    appId: "1:986437344914:web:ca10243c3eb60fbb7b904b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const colectionName = 'chaCaldeirao';

// FUNÇÕES FIREBASE

async function updatePresent(name, isPromised, promisedBy) {
    const snapshot = await db.collection(colectionName)
        .where('name', '==', name) // Filtra pelo campo "name"
        .get();

    if (snapshot.empty) {
        console.error('Nenhum presente encontrado com esse nome.');
        return;
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({
        isPromised: isPromised,
        promisedBy: promisedBy,
    }).catch(error => console.error('Erro ao atualizar presente: ', error));
}

async function getPresents(isPromised) {
    let presents = [];
    await db.collection(colectionName).where('isPromised', '==', isPromised)
        .orderBy('createdAt', 'asc')
        .get()
        .then((querySnapshot) => {
            if (!querySnapshot.empty)
                querySnapshot.forEach((doc) => presents.push(doc.data().name));
        }).catch(error => console.error("Erro ao buscar presentes:", error));
    return presents;
}


// CÓDIGO PRINCIPAL

let availableList = [];
let promisedList = [];
let choosedPresent = [];
const PIX_KEY = '22998102001';

init();

async function init() {
    document.getElementById('pixKeyLabel').innerHTML = PIX_KEY;
    await setListValues();
    listenEvents();
}

function listenEvents() {
    const checkboxes = document.querySelectorAll(".availablePresentCheck");
    checkboxes.forEach(checkbox => {
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

    document.getElementById('choosePresentButton').addEventListener('click', openPromissePresentModal);
    document.getElementById('pixKeyContainer').addEventListener('click', copyPixKey);
}

async function setListValues() {
    availableList = await getPresents(false);
    document.getElementById('availableList').innerHTML = '';
    if (availableList.length > 0) {
        availableList.forEach(present => {
            document.getElementById('availableList').innerHTML += `
                <li>
                    <input type="checkbox" value="${present}" id="${present}" class="availablePresentCheck">
                    <label for="${present}">${present}</label>
                </li>
            `;
        });
    } else {
        document.getElementById('promisedList').innerHTML += `
            <p>Todos os presentes que sugerimos já foram escolhidos! 🎉🥳</p>
            <p>Mas fique a vontade pra nos ajudar com o que desejar.</p>
        `;
    }


    promisedList = await getPresents(true);
    document.getElementById('promisedList').innerHTML = '';
    if (promisedList.length > 0) {
        promisedList.forEach(present => {
            document.getElementById('promisedList').innerHTML += `
                <li>
                    <input type="checkbox" value="${present}" id="${present}" checked disabled>
                    <label for="${present}">${present}</label>
                </li>
            `;
        });
    } else {
        document.getElementById('promisedList').innerHTML += `
            <p>Ainda não temos nenhum presente... Você pode ser o primeiro!</p>
        `;
    }
}

async function openPromissePresentModal() {
    const hasChecked = document.querySelector(`#availableList .availablePresentCheck:checked`) !== null;
    if (hasChecked) {
        document.getElementById("promissePresentModal").style.display = "flex";
        document.getElementById("promissedPresent").innerHTML = '';
        choosedPresent.forEach(present => {
            document.getElementById("promissedPresent").innerHTML += `<li><span class="icon"></span>${present}</li>`;
        });
    } else {
        document.getElementById("errorModal").style.display = "flex";
    }
}

function confirmPromissedPresent() {
    formatetPresents = [];
    let promisedBy = document.getElementById("promissedByInput").value;
    document.getElementById("promissePresentModal").style.display = "none";
    choosedPresent.forEach(present => {
        updatePresent(present, true, promisedBy);
        formatetPresents.push(`🎁 ${present}\n`);
    });
    setListValues();
    // sendEmail(promisedBy, formatetPresents, 'Chá de Caldeirão');
    document.getElementById("successModal").style.display = "flex";
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

function copyPixKey() {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            alert("Chave Pix copiada!");
        }).catch(err => {
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