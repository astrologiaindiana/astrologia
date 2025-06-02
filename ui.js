// Funções de UI e navegação
document.addEventListener('DOMContentLoaded', () => {
    // Configurar navegação da sidebar
    setupNavigation();
    
    // Configurar modais
    setupModals();
    
    // Configurar filtros
    setupFilters();
    
    // Configurar formulários
    setupForms();
    
    // Configurar botões de exportação
    setupExportButtons();
});

// Configurar navegação
function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav li');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remover classe active de todos os itens
            navItems.forEach(i => i.classList.remove('active'));
            
            // Adicionar classe active ao item clicado
            item.classList.add('active');
            
            // Obter página a ser exibida
            const pageId = item.getAttribute('data-page');
            
            // Mostrar página correspondente
            showPage(pageId);
        });
    });
}

// Mostrar página
function showPage(pageId) {
    // Esconder todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Mostrar página selecionada
    const selectedPage = document.getElementById(`${pageId}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

// Configurar modais
function setupModals() {
    // Adicionar event listeners para fechar modais
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Fechar modal ao clicar fora do conteúdo
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Configurar modal de tipo de mapa
    const addMapTypeBtn = document.getElementById('add-map-type-btn');
    if (addMapTypeBtn) {
        addMapTypeBtn.addEventListener('click', () => {
            // Limpar formulário
            document.getElementById('map-type-form').reset();
            document.getElementById('map-type-id').value = '';
            document.getElementById('map-type-modal-title').textContent = 'Adicionar Tipo de Mapa';
            
            // Abrir modal
            openModal('map-type-modal');
        });
    }
    
    // Configurar modal de agendamento
    const addVideocallBtn = document.getElementById('add-videocall-btn');
    if (addVideocallBtn) {
        addVideocallBtn.addEventListener('click', () => {
            // Limpar formulário
            document.getElementById('schedule-form').reset();
            
            // Abrir modal
            openModal('schedule-modal');
        });
    }
}

// Configurar filtros
function setupFilters() {
    // Filtros do painel de pedidos
    const filterResponsible = document.getElementById('filter-responsible');
    const filterStatus = document.getElementById('filter-status');
    const filterMapType = document.getElementById('filter-map-type');
    const filterDate = document.getElementById('filter-date');
    
    // Aplicar filtros ao mudar valores
    const applyOrdersFilter = () => {
        const filters = {
            responsible: filterResponsible ? filterResponsible.value : '',
            status: filterStatus ? filterStatus.value : '',
            mapType: filterMapType ? filterMapType.value : '',
            date: filterDate ? filterDate.value : ''
        };
        
        loadOrders(filters);
    };
    
    // Adicionar event listeners
    if (filterResponsible) filterResponsible.addEventListener('change', applyOrdersFilter);
    if (filterStatus) filterStatus.addEventListener('change', applyOrdersFilter);
    if (filterMapType) filterMapType.addEventListener('change', applyOrdersFilter);
    if (filterDate) filterDate.addEventListener('change', applyOrdersFilter);
    
    // Busca de clientes
    const clientSearch = document.getElementById('client-search');
    const clientSearchBtn = document.getElementById('client-search-btn');
    
    if (clientSearchBtn) {
        clientSearchBtn.addEventListener('click', () => {
            const searchTerm = clientSearch ? clientSearch.value : '';
            loadClients(searchTerm);
        });
    }
    
    if (clientSearch) {
        clientSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = clientSearch.value;
                loadClients(searchTerm);
            }
        });
    }
    
    // Seletor de período financeiro
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões
            periodButtons.forEach(b => b.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Obter período selecionado
            const period = button.getAttribute('data-period');
            
            // Carregar dados financeiros
            loadFinancialData(period);
        });
    });
}

// Configurar formulários
function setupForms() {
    // Formulário de nova venda
    const newSaleForm = document.getElementById('new-sale-form');
    if (newSaleForm) {
        newSaleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Obter dados do formulário
            const saleData = {
                name: document.getElementById('client-name').value,
                whatsapp: document.getElementById('client-whatsapp').value,
                birthDate: document.getElementById('birth-date').value,
                birthTime: document.getElementById('birth-time').value,
                birthPlace: document.getElementById('birth-place').value,
                mapType: document.getElementById('map-type').value,
                responsible: document.getElementById('responsible').value,
                requiresVideocall: document.getElementById('requires-videocall').checked
            };
            
            // Registrar venda
            createNewSale(saleData);
        });
    }
    
    // Formulário de tipo de mapa
    const mapTypeForm = document.getElementById('map-type-form');
    if (mapTypeForm) {
        mapTypeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Obter dados do formulário
            const mapTypeData = {
                name: document.getElementById('map-type-name').value,
                value: parseFloat(document.getElementById('map-type-value').value)
            };
            
            const mapTypeId = document.getElementById('map-type-id').value;
            
            if (mapTypeId) {
                // Atualizar tipo de mapa existente
                updateMapType(mapTypeId, mapTypeData);
            } else {
                // Adicionar novo tipo de mapa
                addMapType(mapTypeData);
            }
            
            // Fechar modal
            closeModal('map-type-modal');
        });
    }
    
    // Formulário de agendamento
    const scheduleForm = document.getElementById('schedule-form');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Obter dados do formulário
            const clientSelect = document.getElementById('schedule-client');
            const clientOption = clientSelect.options[clientSelect.selectedIndex];
            
            const scheduleData = {
                clientId: clientSelect.value,
                clientName: clientOption.textContent,
                whatsapp: clientOption.getAttribute('data-whatsapp'),
                dateTime: `${document.getElementById('schedule-date').value}T${document.getElementById('schedule-time').value}:00`,
                notes: document.getElementById('schedule-notes').value
            };
            
            // Agendar videochamada
            scheduleVideoCall(scheduleData);
            
            // Fechar modal
            closeModal('schedule-modal');
        });
    }
}

// Configurar botões de exportação
function setupExportButtons() {
    // Exportar pedidos
    const exportQueueBtn = document.getElementById('export-queue-csv');
    if (exportQueueBtn) {
        exportQueueBtn.addEventListener('click', () => {
            exportTableToCSV('orders-table', 'pedidos.csv');
        });
    }
    
    // Exportar clientes
    const exportClientsBtn = document.getElementById('export-clients-csv');
    if (exportClientsBtn) {
        exportClientsBtn.addEventListener('click', () => {
            exportTableToCSV('clients-table', 'clientes.csv');
        });
    }
    
    // Exportar dados financeiros
    const exportFinancialBtn = document.getElementById('export-financial-csv');
    if (exportFinancialBtn) {
        exportFinancialBtn.addEventListener('click', () => {
            // Obter período atual
            const periodButtons = document.querySelectorAll('.period-selector button');
            let currentPeriod = 'day';
            
            periodButtons.forEach(button => {
                if (button.classList.contains('active')) {
                    currentPeriod = button.getAttribute('data-period');
                }
            });
            
            // Nome do arquivo baseado no período
            const filename = `financeiro_${currentPeriod}.csv`;
            
            // Exportar dados
            exportTableToCSV('financial-table', filename);
        });
    }
}
