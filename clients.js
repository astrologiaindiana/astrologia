// Funções específicas para a página de Clientes
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupClientsPage();
});

// Configurar página de Clientes
function setupClientsPage() {
    // Configurar modal de detalhes do cliente
    setupClientDetailsModal();
}

// Atualizar UI com os clientes
function updateClientsUI(clients) {
    const tableBody = document.querySelector('#clients-table tbody');
    const emptyState = document.getElementById('clients-empty');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (clients.length === 0) {
        // Mostrar estado vazio
        showEmptyState('clients-empty');
        return;
    }
    
    // Esconder estado vazio
    hideEmptyState('clients-empty');
    
    // Adicionar clientes à tabela
    clients.forEach(client => {
        const row = document.createElement('tr');
        
        // Formatar data da última compra
        let lastPurchaseFormatted = 'Nenhuma compra';
        if (client.lastPurchase) {
            const date = new Date(client.lastPurchase);
            lastPurchaseFormatted = formatDate(date);
        }
        
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.whatsapp}</td>
            <td>${client.purchaseCount}</td>
            <td>${lastPurchaseFormatted}</td>
            <td class="actions">
                <button class="btn btn-outline view-client" data-id="${client.id}">
                    <i class="fas fa-eye"></i> Detalhes
                </button>
                <button class="btn btn-primary open-whatsapp" data-number="${client.whatsapp}">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
            </td>
        `;
        
        // Adicionar à tabela
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para botões
    addClientButtonListeners();
}

// Adicionar event listeners para botões da tabela de clientes
function addClientButtonListeners() {
    // Botões de visualizar cliente
    const viewButtons = document.querySelectorAll('.view-client');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const clientId = button.getAttribute('data-id');
            viewClientDetails(clientId);
        });
    });
    
    // Botões de WhatsApp
    const whatsappButtons = document.querySelectorAll('.open-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-number');
            openWhatsApp(number, 'Olá! Estou entrando em contato da Astrologia Indiana.');
        });
    });
}

// Visualizar detalhes do cliente
function viewClientDetails(clientId) {
    // Buscar detalhes do cliente
    airtableBase(TABLES.CLIENTS).find(clientId, (err, record) => {
        if (err) {
            console.error('Erro ao buscar detalhes do cliente:', err);
            showToast('Erro ao buscar detalhes do cliente', 'error');
            return;
        }
        
        // Preencher modal com os dados do cliente
        const client = {
            id: record.id,
            name: record.get('Nome'),
            whatsapp: record.get('WhatsApp'),
            birthDate: record.get('Data de Nascimento'),
            birthTime: record.get('Hora de Nascimento'),
            birthPlace: record.get('Local de Nascimento')
        };
        
        document.getElementById('modal-client-name').textContent = client.name;
        document.getElementById('modal-client-whatsapp').textContent = `WhatsApp: ${client.whatsapp}`;
        
        let birthInfo = '';
        if (client.birthDate) {
            birthInfo += `Nascimento: ${client.birthDate}`;
            
            if (client.birthTime) {
                birthInfo += ` às ${client.birthTime}`;
            }
            
            if (client.birthPlace) {
                birthInfo += `, ${client.birthPlace}`;
            }
        }
        
        document.getElementById('modal-client-birth').textContent = birthInfo;
        
        // Configurar botão de WhatsApp
        const whatsappBtn = document.getElementById('modal-whatsapp-btn');
        whatsappBtn.onclick = () => openWhatsApp(client.whatsapp, 'Olá! Estou entrando em contato da Astrologia Indiana.');
        
        // Configurar botão de nova venda
        const newSaleBtn = document.getElementById('modal-new-sale-btn');
        newSaleBtn.onclick = () => {
            // Fechar modal
            closeModal('client-details-modal');
            
            // Navegar para página de nova venda
            const newSaleNavItem = document.querySelector('.sidebar-nav li[data-page="new-sale"]');
            if (newSaleNavItem) {
                newSaleNavItem.click();
                
                // Preencher formulário com dados do cliente
                setTimeout(() => {
                    document.getElementById('client-name').value = client.name;
                    document.getElementById('client-whatsapp').value = client.whatsapp;
                    
                    if (client.birthDate) {
                        document.getElementById('birth-date').value = client.birthDate;
                    }
                    
                    if (client.birthTime) {
                        document.getElementById('birth-time').value = client.birthTime;
                    }
                    
                    if (client.birthPlace) {
                        document.getElementById('birth-place').value = client.birthPlace;
                    }
                }, 100);
            }
        };
        
        // Buscar histórico de compras do cliente
        loadClientHistory(clientId);
        
        // Abrir modal
        openModal('client-details-modal');
    });
}

// Carregar histórico de compras do cliente
function loadClientHistory(clientId) {
    const tableBody = document.querySelector('#client-history-table tbody');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Buscar pedidos do cliente
    airtableBase(TABLES.ORDERS).select({
        filterByFormula: `{Cliente} = '${clientId}'`,
        sort: [{field: 'Data da Compra', direction: 'desc'}]
    }).eachPage(function page(records, fetchNextPage) {
        // Processar os registros desta página
        records.forEach(record => {
            const order = {
                id: record.id,
                purchaseDate: record.get('Data da Compra'),
                mapType: record.get('Tipo de Mapa'),
                responsible: record.get('Responsável'),
                status: record.get('Status')
            };
            
            const row = document.createElement('tr');
            
            // Formatar data
            const date = new Date(order.purchaseDate);
            const formattedDate = formatDate(date);
            
            // Status com cor
            const statusClass = order.status === 'Enviado' ? 'success' : 'warning';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${order.mapType}</td>
                <td>${order.responsible}</td>
                <td><span class="status ${statusClass}">${order.status}</span></td>
            `;
            
            // Adicionar à tabela
            tableBody.appendChild(row);
        });
        
        // Buscar a próxima página, se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar histórico do cliente:', err);
            showToast('Erro ao carregar histórico do cliente', 'error');
        }
    });
}

// Configurar modal de detalhes do cliente
function setupClientDetailsModal() {
    // Fechar modal ao clicar no X
    const closeButton = document.querySelector('#client-details-modal .close-modal');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            closeModal('client-details-modal');
        });
    }
    
    // Fechar modal ao clicar fora do conteúdo
    const modal = document.getElementById('client-details-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal('client-details-modal');
            }
        });
    }
}
