// Funções específicas para a página de Nova Venda
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupNewSalePage();
});

// Configurar página de Nova Venda
function setupNewSalePage() {
    // Preencher select de tipos de mapa quando a página for carregada
    loadMapTypesForSelect();
}

// Carregar tipos de mapa para o select
function loadMapTypesForSelect() {
    const mapTypeSelect = document.getElementById('map-type');
    
    if (!mapTypeSelect) return;
    
    // Limpar opções existentes
    mapTypeSelect.innerHTML = '<option value="" disabled selected>Selecione um tipo de mapa</option>';
    
    // Buscar tipos de mapa do Airtable
    airtableBase(TABLES.MAP_TYPES).select({
        view: 'Grid view'
    }).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        records.forEach(record => {
            const option = document.createElement('option');
            option.value = record.get('Nome');
            option.textContent = `${record.get('Nome')} - ${formatCurrency(record.get('Valor'))}`;
            
            mapTypeSelect.appendChild(option);
        });
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar tipos de mapa:', err);
            showToast('Erro ao carregar tipos de mapa', 'error');
        }
    });
}

// Resetar formulário de nova venda
function resetNewSaleForm() {
    const form = document.getElementById('new-sale-form');
    if (form) {
        form.reset();
    }
}
