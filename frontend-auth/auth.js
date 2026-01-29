// auth.js - Gestion de l'authentification frontend

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Affiche un message à l'utilisateur
 * @param {string} message - Le message à afficher
 * @param {string} type - Type de message ('error' ou 'success')
 */
function showMessage(message, type = 'error') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Lit les données d'un formulaire
 * @param {HTMLFormElement} form - Le formulaire à lire
 * @returns {Object} Les données du formulaire
 */
function readFormData(form) {
    const formData = new FormData(form);
    return Object.fromEntries(formData.entries());
}

/**
 * Envoie des données vers le backend
 * @param {string} endpoint - L'endpoint API
 * @param {Object} data - Les données à envoyer
 * @returns {Promise<Response>} La réponse de la requête
 */
async function sendToBackend(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });
        return response;
    } catch (error) {
        throw new Error('Erreur de connexion au serveur');
    }
}

/**
 * Stocke temporairement des informations dans le localStorage
 * @param {string} key - La clé de stockage
 * @param {any} value - La valeur à stocker
 */
function storeLocally(key, value) {
    if (typeof value === 'object') {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.setItem(key, value);
    }
}

/**
 * Récupère des informations du localStorage
 * @param {string} key - La clé de stockage
 * @returns {any} La valeur stockée
 */
function getFromLocalStorage(key) {
    const value = localStorage.getItem(key);
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

/**
 * Gère la soumission du formulaire d'inscription
 * @param {Event} e - L'événement de soumission
 */
async function handleRegister(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const data = readFormData(form);

    // Validation côté client
    if (data.password.length < 6) {
        showMessage('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    if (data.poids < 30 || data.poids > 300) {
        showMessage('Le poids doit être entre 30 et 300 kg');
        return;
    }

    if (data.taille < 100 || data.taille > 250) {
        showMessage('La taille doit être entre 100 et 250 cm');
        return;
    }

    if (data.age < 13 || data.age > 120) {
        showMessage('L\'âge doit être entre 13 et 120 ans');
        return;
    }

    // Afficher le loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const processedData = {
            username: data.username,
            email: data.email,
            password: data.password,
            poids: parseFloat(data.poids),
            taille: parseInt(data.taille),
            age: parseInt(data.age)
        };

        const res = await sendToBackend('/users/register', processedData);

        if (res.ok) {
            showMessage('Compte créé avec succès ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            const error = await res.text();
            showMessage('Erreur lors de l\'inscription : ' + error);
        }
    } catch (error) {
        showMessage(error.message);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

/**
 * Gère la soumission du formulaire de connexion
 * @param {Event} e - L'événement de soumission
 */
async function handleLogin(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = document.getElementById('submitBtn');
    const data = readFormData(form);

    // Validation basique
    if (!data.email || !data.password) {
        showMessage('Veuillez remplir tous les champs');
        return;
    }

    // Afficher le loading
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        const res = await sendToBackend('/users/login', data);

        if (res.ok) {
            const user = await res.json();
            storeLocally('userEmail', data.email);
            storeLocally('userData', user);
            showMessage('Connexion réussie ! Redirection...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            const error = await res.text();
            showMessage('Erreur de connexion : ' + error);
        }
    } catch (error) {
        showMessage('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Initialisation des gestionnaires d'événements
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});