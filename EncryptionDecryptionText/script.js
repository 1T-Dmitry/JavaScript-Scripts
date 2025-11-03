const encryptionAlgorithms = {
    caesar: {
        encrypt: (text, key) => {
            if (!key) key = 3;
            key = parseInt(key);
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = char === char.toUpperCase();
                    const offset = isUpperCase ? 65 : 97;
                    return String.fromCharCode(((code - offset + key) % 26) + offset);
                }
                return char;
            }).join('');
        },
        decrypt: (text, key) => {
            if (!key) key = 3;
            key = parseInt(key);
            return encryptionAlgorithms.caesar.encrypt(text, 26 - key);
        }
    },
    atbash: {
        encrypt: (text) => {
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = char === char.toUpperCase();
                    const offset = isUpperCase ? 65 : 97;
                    return String.fromCharCode(25 - (code - offset) + offset);
                }
                return char;
            }).join('');
        },
        decrypt: (text) => {
            return encryptionAlgorithms.atbash.encrypt(text);
        }
    },
    reverse: {
        encrypt: (text) => {
            return text.split('').reverse().join('');
        },
        decrypt: (text) => {
            return encryptionAlgorithms.reverse.encrypt(text);
        }
    },
    vigenere: {
        encrypt: (text, key) => {
            if (!key) key = "KEY";
            key = key.toUpperCase();
            let keyIndex = 0;
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = char === char.toUpperCase();
                    const offset = isUpperCase ? 65 : 97;
                    const keyChar = key[keyIndex % key.length].toUpperCase();
                    const keyOffset = keyChar.charCodeAt(0) - 65;
                    const result = String.fromCharCode(((code - offset + keyOffset) % 26) + offset);
                    keyIndex++;
                    return result;
                }
                return char;
            }).join('');
        },
        decrypt: (text, key) => {
            if (!key) key = "KEY";
            key = key.toUpperCase();
            let keyIndex = 0;
            return text.split('').map(char => {
                if (char.match(/[a-z]/i)) {
                    const code = char.charCodeAt(0);
                    const isUpperCase = char === char.toUpperCase();
                    const offset = isUpperCase ? 65 : 97;
                    const keyChar = key[keyIndex % key.length].toUpperCase();
                    const keyOffset = keyChar.charCodeAt(0) - 65;
                    const result = String.fromCharCode(((code - offset - keyOffset + 26) % 26) + offset);
                    keyIndex++;
                    return result;
                }
                return char;
            }).join('');
        }
    }
};

const algorithmSelect = document.getElementById('algorithm');
const keySection = document.getElementById('key-section');
const keyInput = document.getElementById('key');
const textInput = document.getElementById('text-input');
const encryptBtn = document.getElementById('encrypt-btn');
const decryptBtn = document.getElementById('decrypt-btn');
const clearBtn = document.getElementById('clear-btn');
const resultOutput = document.getElementById('result-output');
const saveBtn = document.getElementById('save-btn');
const messagesList = document.getElementById('messages-list');

let savedMessages = JSON.parse(localStorage.getItem('encryptedMessages')) || [];

function init() {
    updateKeyVisibility();
    renderSavedMessages();
    
    algorithmSelect.addEventListener('change', updateKeyVisibility);
    encryptBtn.addEventListener('click', encryptText);
    decryptBtn.addEventListener('click', decryptText);
    clearBtn.addEventListener('click', clearText);
    saveBtn.addEventListener('click', saveResult);
}

function updateKeyVisibility() {
    const algorithm = algorithmSelect.value;
    if (algorithm === 'atbash' || algorithm === 'reverse') {
        keySection.style.display = 'none';
    } else {
        keySection.style.display = 'block';
    }
}

function encryptText() {
    const text = textInput.value.trim();
    if (!text) {
        alert('Введите текст для шифрования');
        return;
    }
    
    const algorithm = algorithmSelect.value;
    const key = keyInput.value;
    
    try {
        const encrypted = encryptionAlgorithms[algorithm].encrypt(text, key);
        displayResult(encrypted, 'encrypted');
    } catch (error) {
        alert('Ошибка при шифровании: ' + error.message);
    }
}

function decryptText() {
    const text = textInput.value.trim();
    if (!text) {
        alert('Введите текст для дешифрования');
        return;
    }
    
    const algorithm = algorithmSelect.value;
    const key = keyInput.value;
    
    try {
        const decrypted = encryptionAlgorithms[algorithm].decrypt(text, key);
        displayResult(decrypted, 'decrypted');
    } catch (error) {
        alert('Ошибка при дешифровании: ' + error.message);
    }
}

function displayResult(result, type) {
    resultOutput.innerHTML = `<p class="${type}">${result}</p>`;
}

function clearText() {
    textInput.value = '';
    resultOutput.innerHTML = '<p>Здесь появится результат...</p>';
}

function saveResult() {
    const result = resultOutput.textContent;
    if (!result || result === 'Здесь появится результат...') {
        alert('Нет результата для сохранения');
        return;
    }
    
    const algorithm = algorithmSelect.value;
    const key = keyInput.value;
    
    const message = {
        id: Date.now(),
        algorithm: algorithm,
        key: key,
        content: result,
        timestamp: new Date().toLocaleString()
    };
    
    savedMessages.push(message);
    localStorage.setItem('encryptedMessages', JSON.stringify(savedMessages));
    renderSavedMessages();
    alert('Сообщение сохранено!');
}

function renderSavedMessages() {
    if (savedMessages.length === 0) {
        messagesList.innerHTML = '<p class="no-messages">Нет сохранённых сообщений</p>';
        return;
    }
    
    messagesList.innerHTML = savedMessages.map(message => `
        <div class="message-item">
            <div class="message-header">
                <span>Алгоритм: ${getAlgorithmName(message.algorithm)}</span>
                <span>${message.timestamp}</span>
            </div>
            <div class="message-content">${message.content}</div>
            <div class="message-actions">
                <button onclick="loadMessage(${message.id})">Загрузить</button>
                <button onclick="deleteMessage(${message.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

function getAlgorithmName(algorithm) {
    const names = {
        caesar: 'Шифр Цезаря',
        atbash: 'Атбаш',
        reverse: 'Обратный текст',
        vigenere: 'Шифр Виженера'
    };
    return names[algorithm] || algorithm;
}

function loadMessage(id) {
    const message = savedMessages.find(msg => msg.id === id);
    if (message) {
        textInput.value = message.content;
        algorithmSelect.value = message.algorithm;
        keyInput.value = message.key || '';
        updateKeyVisibility();
        resultOutput.innerHTML = '<p>Загруженное сообщение готово для дешифрования</p>';
    }
}

function deleteMessage(id) {
    if (confirm('Удалить это сообщение?')) {
        savedMessages = savedMessages.filter(msg => msg.id !== id);
        localStorage.setItem('encryptedMessages', JSON.stringify(savedMessages));
        renderSavedMessages();
    }
}

document.addEventListener('DOMContentLoaded', init);
