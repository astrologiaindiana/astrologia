// Configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAngAB_zoXr5lsi1N8WocVJeHFq6QjdUUs",
  authDomain: "astrologia-indiana-app.firebaseapp.com",
  projectId: "astrologia-indiana-app",
  storageBucket: "astrologia-indiana-app.appspot.com",
  messagingSenderId: "1055729827966",
  appId: "1:1055729827966:web:51954b0cabee762653d82f",
  measurementId: "G-E1BSNLPJJF"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Configurações do Airtable
const AIRTABLE_API_KEY = 'patkcHF16ytjQFYtf.2d2b97aeab44b5961a1c7e4c68e6f5e2bdef0b81f2cd0303dc2580f9d96df10d';
const AIRTABLE_BASE_ID = 'appc74NoitSC8w1XQ';

// Inicializar Airtable
Airtable.configure({
  apiKey: AIRTABLE_API_KEY
});

const airtableBase = Airtable.base(AIRTABLE_BASE_ID);

// Tabelas do Airtable
const TABLES = {
  ORDERS: 'Pedidos',
  CLIENTS: 'Clientes',
  MAP_TYPES: 'TiposMapas',
  VIDEO_CALLS: 'Videochamadas'
};
