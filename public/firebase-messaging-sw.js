/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyDr4XBOqaEjqL6O0NLpCGsWjHEL6RCNCtk',
    authDomain: 'mymstorie.firebaseapp.com',
    projectId: 'mymstorie',
    messagingSenderId: '484000911482',
    appId: '1:484000911482:web:7b2789e6f0daef7bf1ebc3'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title, { body, data: payload.data });
});
