// Funções específicas para a página de Resumo Financeiro
document.addEventListener('DOMContentLoaded', () => {
    // Adicionar event listeners específicos desta página
    setupFinancialPage();
});

// Configurar página de Resumo Financeiro
function setupFinancialPage() {
    // Inicializar gráficos
    initCharts();
    
    // Configurar navegação de período
    setupPeriodNavigation();
}

// Inicializar gráficos vazios
function initCharts() {
    // Gráfico de tipos de mapa
    const mapTypeCtx = document.getElementById('map-type-chart');
    if (mapTypeCtx) {
        window.mapTypeChart = new Chart(mapTypeCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Vendas por Tipo de Mapa',
                    data: [],
                    backgroundColor: [
                        'rgba(141, 110, 99, 0.7)',
                        'rgba(143, 188, 143, 0.7)',
                        'rgba(212, 175, 55, 0.7)',
                        'rgba(180, 150, 120, 0.7)',
                        'rgba(120, 160, 120, 0.7)'
                    ],
                    borderColor: [
                        'rgba(141, 110, 99, 1)',
                        'rgba(143, 188, 143, 1)',
                        'rgba(212, 175, 55, 1)',
                        'rgba(180, 150, 120, 1)',
                        'rgba(120, 160, 120, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de divisão de receita
    const revenueSplitCtx = document.getElementById('revenue-split-chart');
    if (revenueSplitCtx) {
        window.revenueSplitChart = new Chart(revenueSplitCtx, {
            type: 'pie',
            data: {
                labels: ['Conrado', 'Kavi'],
                datasets: [{
                    data: [0, 0],
                    backgroundColor: [
                        'rgba(141, 110, 99, 0.7)',
                        'rgba(143, 188, 143, 0.7)'
                    ],
                    borderColor: [
                        'rgba(141, 110, 99, 1)',
                        'rgba(143, 188, 143, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Configurar navegação de período
function setupPeriodNavigation() {
    const prevPeriodBtn = document.getElementById('prev-period');
    const nextPeriodBtn = document.getElementById('next-period');
    
    // Data atual para navegação
    window.currentPeriodDate = new Date();
    
    // Período atual (day, week, month)
    window.currentPeriodType = 'day';
    
    // Atualizar título do período
    updatePeriodTitle();
    
    // Carregar dados iniciais
    loadFinancialData(window.currentPeriodType, window.currentPeriodDate);
    
    // Event listeners para botões de período
    const periodButtons = document.querySelectorAll('.period-selector button');
    periodButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões
            periodButtons.forEach(b => b.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Obter período selecionado
            window.currentPeriodType = button.getAttribute('data-period');
            
            // Resetar data para hoje
            window.currentPeriodDate = new Date();
            
            // Atualizar título do período
            updatePeriodTitle();
            
            // Carregar dados financeiros
            loadFinancialData(window.currentPeriodType, window.currentPeriodDate);
        });
    });
    
    // Event listeners para navegação
    if (prevPeriodBtn) {
        prevPeriodBtn.addEventListener('click', () => {
            navigatePeriod(-1);
        });
    }
    
    if (nextPeriodBtn) {
        nextPeriodBtn.addEventListener('click', () => {
            navigatePeriod(1);
        });
    }
}

// Navegar entre períodos
function navigatePeriod(direction) {
    const date = window.currentPeriodDate;
    
    switch (window.currentPeriodType) {
        case 'day':
            date.setDate(date.getDate() + direction);
            break;
        case 'week':
            date.setDate(date.getDate() + (direction * 7));
            break;
        case 'month':
            date.setMonth(date.getMonth() + direction);
            break;
    }
    
    // Atualizar título do período
    updatePeriodTitle();
    
    // Carregar dados financeiros
    loadFinancialData(window.currentPeriodType, date);
}

// Atualizar título do período
function updatePeriodTitle() {
    const periodTitle = document.getElementById('current-period');
    if (!periodTitle) return;
    
    const date = window.currentPeriodDate;
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    
    switch (window.currentPeriodType) {
        case 'day':
            // Verificar se é hoje
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                periodTitle.textContent = 'Hoje';
            } else {
                periodTitle.textContent = date.toLocaleDateString('pt-BR', options);
            }
            break;
        case 'week':
            // Obter domingo e sábado da semana
            const startDate = new Date(date);
            startDate.setDate(date.getDate() - date.getDay()); // Domingo
            
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6); // Sábado
            
            periodTitle.textContent = `${startDate.getDate()} a ${endDate.getDate()} de ${endDate.toLocaleDateString('pt-BR', { month: 'long' })} de ${endDate.getFullYear()}`;
            break;
        case 'month':
            periodTitle.textContent = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            break;
    }
}

// Atualizar UI com os dados financeiros
function updateFinancialUI(orders, period, date) {
    // Calcular estatísticas
    const totalSales = orders.length;
    let totalValue = 0;
    let conradoValue = 0;
    let kaviValue = 0;
    
    // Contagem por tipo de mapa
    const mapTypeCounts = {};
    
    orders.forEach(order => {
        const value = order.value || 0;
        totalValue += value;
        
        // Somar por responsável
        if (order.responsible === 'Conrado') {
            conradoValue += value;
        } else if (order.responsible === 'Kavi') {
            kaviValue += value;
        }
        
        // Contar por tipo de mapa
        if (order.mapType) {
            if (!mapTypeCounts[order.mapType]) {
                mapTypeCounts[order.mapType] = {
                    count: 0,
                    value: 0
                };
            }
            
            mapTypeCounts[order.mapType].count++;
            mapTypeCounts[order.mapType].value += value;
        }
    });
    
    // Atualizar estatísticas na UI
    document.getElementById('total-sales').textContent = totalSales;
    document.getElementById('total-value').textContent = formatCurrency(totalValue);
    document.getElementById('conrado-value').textContent = formatCurrency(conradoValue);
    document.getElementById('kavi-value').textContent = formatCurrency(kaviValue);
    
    // Atualizar gráfico de tipos de mapa
    updateMapTypeChart(mapTypeCounts);
    
    // Atualizar gráfico de divisão de receita
    updateRevenueSplitChart(conradoValue, kaviValue);
}

// Atualizar gráfico de tipos de mapa
function updateMapTypeChart(mapTypeCounts) {
    if (!window.mapTypeChart) return;
    
    const labels = Object.keys(mapTypeCounts);
    const data = labels.map(label => mapTypeCounts[label].count);
    
    window.mapTypeChart.data.labels = labels;
    window.mapTypeChart.data.datasets[0].data = data;
    window.mapTypeChart.update();
}

// Atualizar gráfico de divisão de receita
function updateRevenueSplitChart(conradoValue, kaviValue) {
    if (!window.revenueSplitChart) return;
    
    window.revenueSplitChart.data.datasets[0].data = [conradoValue, kaviValue];
    window.revenueSplitChart.update();
}
