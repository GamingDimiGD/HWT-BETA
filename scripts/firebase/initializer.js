import { alertModal } from "../modal.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app-check.js";
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    getAuth,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-ai.js";


const firebaseConfig = {
    apiKey: "AIzaSyD11nmCg6EMGb9sF-sqKpwdlL-NRVbJj7Q",
    authDomain: "dimigamecenter-hwt.firebaseapp.com",
    databaseURL: "https://dimigamecenter-hwt-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dimigamecenter-hwt",
    storageBucket: "dimigamecenter-hwt.firebasestorage.app",
    messagingSenderId: "813200565603",
    appId: "1:813200565603:web:398f5bed5ecc0b97b01f56",
    measurementId: "G-HQQYD7Z8LR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);
const auth = getAuth(app);
const appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider('6LfkRJkrAAAAAN7wDDtXfMgJ8LT6cymMFUNdT_oN'),
    isTokenAutoRefreshEnabled: true
});

const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

let currentUser = null;


onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        user.reload().then(() => {
            $('.logout').attr('hidden', false)
            $('.login').attr('hidden', true)
            $('#uid-display').text(`郵件: ${user.email}` + (user.emailVerified ? "" : " (尚未驗證)"))
        })
    } else {
        $('.logout').attr('hidden', true)
        $('.login').attr('hidden', false)
        $('#uid-display').text('尚未登入')
    }
});

const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            alertModal('請先驗證郵件再登入!', [
                {
                    text: '再傳送一次', onclick: () => sendEmailVerification(userCredential.user)
                }, 'OK'
            ])
            return;
        }
        $('.account.modal').removeClass('show')
        alertModal('登入成功!')
        return userCredential.user;
    } catch (error) {
        if (error.message === "Firebase: Error (auth/invalid-email).") {
            alertModal('電子郵件不完整!')
        } else if (error.message === 'Firebase: Error (auth/invalid-credential).') {
            alertModal("電子郵件或密碼不對!")
        }
        else alertModal('錯誤:' + error.message);
        throw error;
    }
}

const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        throw error;
    }
}

const createAccount = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user)
        alertModal('已傳送驗證郵件，請檢察信箱和垃圾郵件信箱')
        logoutUser()
        return userCredential.user;
    } catch (error) {
        if (error.message === 'Firebase: Password should be at least 6 characters (auth/weak-password).') alertModal("密碼必須大於6個字元!")
        else if (error.message === "Firebase: Error (auth/invalid-email).") alertModal('電子郵件不完整!')
        else if (error.message === 'Firebase: Error (auth/email-already-in-use).') alertModal('電子郵件已經被其他帳號使用了!')
        else alertModal("錯誤: " + error.message)
        throw error;
    }
}

let emailInput = $('#email-input')
let passwordInput = $("#password-input")

$('#confirm-login').on('click', () => {
    if (!emailInput.val() || !passwordInput.val()) return alertModal("資訊不完整!");
    loginUser(emailInput.val(), passwordInput.val());
})

$('#create-account').on("click", () => {
    if (!emailInput.val() || !passwordInput.val()) return alertModal("資訊不完整!");
    createAccount(emailInput.val(), passwordInput.val());
})

$('.logout').on('click', () => {
    alertModal("確定登出?", [
        {
            text: '對的',
            onclick: logoutUser
        }, '先不'
    ]);
})

$('.reset-password').on('click', () => {
    if (!auth.currentUser) return alertModal("請先登入!");
    alertModal("確定")
})

export { app, db, auth, loginUser, logoutUser, currentUser, analytics, createAccount, ai, model };
import { promptAI } from "./ai.js";
addEventListener("DOMContentLoaded", () => {
    $('.loading-screen')[0].style.height = 0
    $('.loading-screen h1')[0].style.opacity = 0
})