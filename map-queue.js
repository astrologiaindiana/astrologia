// Funções específicas para o Painel de Pedidos
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupMapQueuePage();
});

// Configurar página de Painel de Pedidos
function setupMapQueuePage() {
    // Esta função será chamada quando a página for carregada
}

// Atualizar UI com os pedidos
function updateOrdersUI(orders) {
    const tableBody = document.querySelector('#orders-table tbody');
    const emptyState = document.getElementById('orders-empty');
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (orders.length === 0) {
        // Mostrar estado vazio
        showEmptyState('orders-empty');
        return;
    }
    
    // Esconder estado vazio
    hideEmptyState('orders-empty');
    
    // Adicionar pedidos à tabela
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Formatar data
        const date = new Date(order.purchaseDate);
        const formattedDate = formatDate(date);
        
        // Status com cor
        const statusClass = order.status === 'Enviado' ? 'success' : 'warning';
        
        row.innerHTML = `
            <td>${order.clientName}</td>
            <td>${formattedDate}</td>
            <td>${order.mapType}</td>
            <td>${order.responsible}</td>
            <td><span class="status ${statusClass}">${order.status}</span></td>
            <td class="actions">
                ${order.status === 'Pendente' ? 
                    `<button class="btn btn-outline mark-sent" data-id="${order.id}">
                        <i class="fas fa-check"></i> Marcar como Enviado
                    </button>` : 
                    `<button class="btn btn-outline" disabled>
                        <i class="fas fa-check"></i> Enviado
                    </button>`
                }
                <button class="btn btn-primary open-whatsapp" data-number="${order.whatsapp}">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
            </td>
        `;
        
        // Adicionar à tabela
        tableBody.appendChild(row);
    });
    
    // Adicionar event listeners para botões
    addOrderButtonListeners();
}

// Adicionar event listeners para botões da tabela de pedidos
function addOrderButtonListeners() {
    // Botões de marcar como enviado
    const markSentButtons = document.querySelectorAll('.mark-sent');
    markSentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            markOrderAsSent(orderId);
        });
    });
    
    // Botões de WhatsApp
    const whatsappButtons = document.querySelectorAll('.open-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', () => {
            const number = button.getAttribute('data-number');
            openWhatsApp(number, 'Olá! Estou entrando em contato sobre seu mapa astrológico.');
        });
    });
}
