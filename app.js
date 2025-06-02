// Arquivo principal da aplicação
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    checkAuthState();
    
    // Registrar service worker para PWA
    registerServiceWorker();
    
    // Criar usuários iniciais para demonstração
    // Comentar esta linha em produção
    createInitialUsers();
});

// Arquivo de manifesto para PWA
function createManifestFile() {
    const manifest = {
        "name": "Astrologia Indiana",
        "short_name": "Astrologia",
        "description": "Sistema de gestão para Astrologia Indiana",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#f5f5dc",
        "theme_color": "#8d6e63",
        "icons": [
            {
                "src": "assets/icon-192.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "assets/icon-512.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    };
    
    // Criar arquivo de manifesto
    const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(manifestBlob);
    
    // Criar link para download
    const link = document.createElement('a');
    link.href = manifestURL;
    link.download = 'manifest.json';
    
    // Adicionar ao documento e clicar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Service Worker para PWA
function createServiceWorkerFile() {
    const serviceWorkerCode = `
// Nome do cache
const CACHE_NAME = 'astrologia-indiana-v1';

// Arquivos para cache
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/airtable.js',
    '/js/config.js',
    '/js/utils.js',
    '/js/ui.js',
    '/js/map-queue.js',
    '/js/new-sale.js',
    '/js/clients.js',
    '/js/video-calls.js',
    '/js/financial.js',
    '/js/settings.js',
    '/assets/logo.png',
    '/assets/user-avatar.png',
    '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Ativar Service Worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - retornar resposta do cache
                if (response) {
                    return response;
                }
                
                // Clonar a requisição
                const fetchRequest = event.request.clone();
                
                return fetch(fetchRequest).then(
                    response => {
                        // Verificar se a resposta é válida
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar a resposta
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    }
                );
            })
    );
});
    `;
    
    // Criar arquivo de service worker
    const swBlob = new Blob([serviceWorkerCode], {type: 'application/javascript'});
    const swURL = URL.createObjectURL(swBlob);
    
    // Criar link para download
    const link = document.createElement('a');
    link.href = swURL;
    link.download = 'service-worker.js';
    
    // Adicionar ao documento e clicar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
