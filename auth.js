// Funções de autenticação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário está logado
    checkAuthState();

    // Adicionar event listeners
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

// Verificar estado de autenticação
function checkAuthState() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Usuário está logado
            showMainLayout(user);
        } else {
            // Usuário não está logado
            showLoginScreen();
        }
    });
}

// Fazer login
async function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    if (!email || !password) {
        errorElement.textContent = 'Por favor, preencha todos os campos.';
        return;
    }
    
    try {
        // Limpar mensagem de erro anterior
        errorElement.textContent = '';
        
        // Tentar fazer login
        await auth.signInWithEmailAndPassword(email, password);
        
        // Login bem-sucedido, o listener onAuthStateChanged cuidará da navegação
    } catch (error) {
        console.error('Erro de login:', error);
        
        // Exibir mensagem de erro amigável
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            errorElement.textContent = 'E-mail ou senha incorretos.';
        } else if (error.code === 'auth/invalid-email') {
            errorElement.textContent = 'E-mail inválido.';
        } else {
            errorElement.textContent = 'Erro ao fazer login. Tente novamente.';
        }
    }
}

// Fazer logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            // Logout bem-sucedido, o listener onAuthStateChanged cuidará da navegação
        })
        .catch(error => {
            console.error('Erro ao fazer logout:', error);
            showToast('Erro ao fazer logout. Tente novamente.', 'error');
        });
}

// Mostrar tela de login
function showLoginScreen() {
    document.getElementById('login-screen').classList.add('active');
    document.getElementById('main-layout').classList.remove('active');
    
    // Limpar campos de login
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').textContent = '';
}

// Mostrar layout principal
function showMainLayout(user) {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('main-layout').classList.add('active');
    
    // Atualizar informações do usuário
    const userName = user.email.includes('conrado') ? 'Conrado' : 'Kavi';
    document.getElementById('user-name').textContent = userName;
    
    // Carregar dados iniciais
    loadInitialData();
}

// Carregar dados iniciais após login
function loadInitialData() {
    // Carregar tipos de mapas
    loadMapTypes();
    
    // Carregar pedidos
    loadOrders();
    
    // Carregar clientes
    loadClients();
    
    // Carregar videochamadas
    loadVideoCalls();
    
    // Carregar dados financeiros
    loadFinancialData();
}

// Criar usuários iniciais (apenas para demonstração)
function createInitialUsers() {
    // Normalmente, isso seria feito no console do Firebase
    // Aqui é apenas para demonstração
    const users = [
        { email: 'conrado@astrologiaindiana.com', password: 'senha123' },
        { email: 'kavi@astrologiaindiana.com', password: 'senha123' }
    ];
    
    users.forEach(user => {
        auth.createUserWithEmailAndPassword(user.email, user.password)
            .then(userCredential => {
                console.log(`Usuário ${user.email} criado com sucesso`);
            })
            .catch(error => {
                // Ignorar erro se o usuário já existir
                if (error.code !== 'auth/email-already-in-use') {
                    console.error(`Erro ao criar usuário ${user.email}:`, error);
                }
            });
    });
}
