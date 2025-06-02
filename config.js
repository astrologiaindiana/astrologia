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

// Tabelas do Airtable - Usando os nomes exatos das tabelas do seu Airtable
const TABLES = {
  ORDERS: 'Pedidos',
  CLIENTS: 'Clientes',
  MAP_TYPES: 'TiposMapas',  // Nome corrigido conforme sua base Airtable
  VIDEO_CALLS: 'Videochamadas'
};

// Inicializar Airtable - Garantindo que seja feito aqui no config.js
Airtable.configure({
  apiKey: AIRTABLE_API_KEY
});

// Definindo airtableBase como variável global para ser acessível em todos os arquivos
window.airtableBase = Airtable.base(AIRTABLE_BASE_ID);

// Definindo funções globais para manipulação do Airtable
// Estas funções precisam estar no escopo global para serem acessíveis em todos os arquivos

// Carregar tipos de mapa
window.loadMapTypes = function(callback) {
  console.log("Carregando tipos de mapa...");
  
  try {
    window.airtableBase(TABLES.MAP_TYPES).select({
      view: 'Grid view',
      sort: [{field: 'Nome', direction: 'asc'}]
    }).eachPage(function page(records, fetchNextPage) {
      const mapTypes = records.map(record => ({
        id: record.id,
        name: record.get('Nome'),
        value: record.get('Valor') || 0
      }));
      
      if (callback) {
        callback(mapTypes);
      }
      
      fetchNextPage();
    }, function done(err) {
      if (err) {
        console.error('Erro ao carregar tipos de mapa:', err);
        showToast('Erro ao carregar tipos de mapa', 'error');
      }
    });
  } catch (error) {
    console.error("Erro ao carregar tipos de mapa:", error);
    showToast("Erro ao carregar dados: " + error.message, "error");
  }
};

// Adicionar tipo de mapa
window.addMapType = function(name, value, callback) {
  console.log(`Adicionando tipo de mapa: ${name}, valor: ${value}`);
  
  try {
    window.airtableBase(TABLES.MAP_TYPES).create({
      'Nome': name,
      'Valor': parseFloat(value)
    }, function(err, record) {
      if (err) {
        console.error('Erro ao adicionar tipo de mapa:', err);
        showToast('Erro ao adicionar tipo de mapa', 'error');
        return;
      }
      
      showToast('Tipo de mapa adicionado com sucesso', 'success');
      
      if (callback) {
        callback({
          id: record.id,
          name: name,
          value: parseFloat(value)
        });
      }
    });
  } catch (error) {
    console.error("Erro ao adicionar tipo de mapa:", error);
    showToast("Erro ao adicionar dados: " + error.message, "error");
  }
};

// Atualizar tipo de mapa
window.updateMapType = function(id, name, value, callback) {
  console.log(`Atualizando tipo de mapa: ${id}, nome: ${name}, valor: ${value}`);
  
  try {
    window.airtableBase(TABLES.MAP_TYPES).update(id, {
      'Nome': name,
      'Valor': parseFloat(value)
    }, function(err, record) {
      if (err) {
        console.error('Erro ao atualizar tipo de mapa:', err);
        showToast('Erro ao atualizar tipo de mapa', 'error');
        return;
      }
      
      showToast('Tipo de mapa atualizado com sucesso', 'success');
      
      if (callback) {
        callback({
          id: record.id,
          name: name,
          value: parseFloat(value)
        });
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar tipo de mapa:", error);
    showToast("Erro ao atualizar dados: " + error.message, "error");
  }
};

// Excluir tipo de mapa
window.deleteMapType = function(id, callback) {
  console.log(`Excluindo tipo de mapa: ${id}`);
  
  try {
    window.airtableBase(TABLES.MAP_TYPES).destroy(id, function(err, deletedRecord) {
      if (err) {
        console.error('Erro ao excluir tipo de mapa:', err);
        showToast('Erro ao excluir tipo de mapa', 'error');
        return;
      }
      
      showToast('Tipo de mapa excluído com sucesso', 'success');
      
      if (callback) {
        callback(id);
      }
    });
  } catch (error) {
    console.error("Erro ao excluir tipo de mapa:", error);
    showToast("Erro ao excluir dados: " + error.message, "error");
  }
};

// Log para confirmar inicialização
console.log("Config.js carregado: Firebase e Airtable inicializados com funções globais");
