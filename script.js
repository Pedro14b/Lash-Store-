// SELEÇÃO DE ELEMENTOS DO DOM
const btnsAddCart = document.querySelectorAll('.btn-add-cart');
const cartCount = document.getElementById('cart-count');
const carrinhoVazio = document.getElementById('carrinho-vazio');
const carrinhoItems = document.getElementById('carrinho-items');
const carrinhoTbody = document.getElementById('carrinho-tbody');
const totalPreco = document.getElementById('total-preco');
const btnFinalizar = document.getElementById('btn-finalizar');
const btnLimpar = document.getElementById('btn-limpar');
const formContato = document.getElementById('form-contato');

// CLASSE PRODUTO
class ProdutoCarrinho {
    constructor(id, nome, preco, quantidade = 1) {
        this.id = id;
        this.nome = nome;
        this.preco = parseFloat(preco);
        this.quantidade = quantidade;
    }

    getSubtotal() {
        return this.preco * this.quantidade;
    }
}

// Carrinho de compras - persiste no localStorage
let carrinho = (JSON.parse(localStorage.getItem('carrinho')) || []).map(item => 
    new ProdutoCarrinho(item.id, item.nome, item.preco, item.quantidade)
);

// INICIALIZAÇÃO
renderCarrinho();
atualizarContadorCarrinho();

// EVENT LISTENERS
btnsAddCart.forEach(btn => {
    btn.addEventListener('click', function() {
        const id = this.dataset.id;
        const nome = this.dataset.nome;
        const preco = this.dataset.preco;
        
        adicionarAoCarrinho(id, nome, preco);
    });
});

btnFinalizar.addEventListener('click', finalizarCompra);
btnLimpar.addEventListener('click', limparCarrinho);

formContato.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const assunto = document.getElementById('assunto').value;
    
    if (!nome || !email || !assunto) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    alert(`Obrigado, ${nome}! Sua mensagem foi enviada com sucesso.\nResponderemos em breve no email: ${email}`);
    formContato.reset();
});

// ADICIONAR AO CARRINHO
function adicionarAoCarrinho(id, nome, preco) {
    const produtoExistente = carrinho.find(item => item.id === id);
    
    if (produtoExistente) {
        produtoExistente.quantidade++;
    } else {
        const novoProduto = new ProdutoCarrinho(id, nome, preco);
        carrinho.push(novoProduto);
    }
    
    salvarCarrinho();
    renderCarrinho();
    atualizarContadorCarrinho();
    mostrarNotificacao(`${nome} adicionado ao carrinho!`);
}

// REMOVER DO CARRINHO
function removerDoCarrinho(id) {
    if (confirm('Deseja remover este produto do carrinho?')) {
        carrinho = carrinho.filter(item => item.id !== id);
        salvarCarrinho();
        renderCarrinho();
        atualizarContadorCarrinho();
        mostrarNotificacao('Produto removido do carrinho');
    }
}

// ALTERAR QUANTIDADE
function alterarQuantidade(id, novaQuantidade) {
    const produto = carrinho.find(item => item.id === id);
    
    if (produto) {
        novaQuantidade = Math.max(1, parseInt(novaQuantidade));
        produto.quantidade = novaQuantidade;
        salvarCarrinho();
        renderCarrinho();
        atualizarContadorCarrinho();
    }
}

// RENDERIZAR CARRINHO
function renderCarrinho() {
    carrinhoTbody.innerHTML = '';
    
    if (carrinho.length === 0) {
        carrinhoVazio.style.display = 'block';
        carrinhoItems.style.display = 'none';
        return;
    }
    
    carrinhoVazio.style.display = 'none';
    carrinhoItems.style.display = 'block';
    
    carrinho.forEach(produto => {
        const tr = document.createElement('tr');
        
        const tdNome = document.createElement('td');
        tdNome.textContent = produto.nome;
        
        const tdPreco = document.createElement('td');
        tdPreco.textContent = `R$ ${produto.preco.toFixed(2)}`;
        
        const tdQtd = document.createElement('td');
        const inputQtd = document.createElement('input');
        inputQtd.type = 'number';
        inputQtd.min = '1';
        inputQtd.value = produto.quantidade;
        inputQtd.style.width = '60px';
        inputQtd.style.padding = '5px';
        inputQtd.style.textAlign = 'center';
        inputQtd.addEventListener('change', function() {
            alterarQuantidade(produto.id, this.value);
        });
        tdQtd.appendChild(inputQtd);
        
        const tdSubtotal = document.createElement('td');
        tdSubtotal.textContent = `R$ ${produto.getSubtotal().toFixed(2)}`;
        
        const tdRemover = document.createElement('td');
        const btnRemover = document.createElement('button');
        btnRemover.textContent = '🗑️ Remover';
        btnRemover.style.backgroundColor = '#ff6b6b';
        btnRemover.style.color = 'white';
        btnRemover.style.border = 'none';
        btnRemover.style.padding = '8px 12px';
        btnRemover.style.borderRadius = '5px';
        btnRemover.style.cursor = 'pointer';
        btnRemover.addEventListener('click', () => removerDoCarrinho(produto.id));
        tdRemover.appendChild(btnRemover);
        
        tr.appendChild(tdNome);
        tr.appendChild(tdPreco);
        tr.appendChild(tdQtd);
        tr.appendChild(tdSubtotal);
        tr.appendChild(tdRemover);
        
        carrinhoTbody.appendChild(tr);
    });
    
    atualizarTotal();
}

// ATUALIZAR TOTAL
function atualizarTotal() {
    const total = carrinho.reduce((acc, item) => acc + item.getSubtotal(), 0);
    totalPreco.textContent = total.toFixed(2).replace('.', ',');
}

// ATUALIZAR CONTADOR
function atualizarContadorCarrinho() {
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    cartCount.textContent = totalItens;
}

// LIMPAR CARRINHO
function limparCarrinho() {
    if (confirm('Deseja limpar todo o carrinho?')) {
        carrinho = [];
        salvarCarrinho();
        renderCarrinho();
        atualizarContadorCarrinho();
        mostrarNotificacao('Carrinho limpo!');
    }
}

// FINALIZAR COMPRA
function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const total = carrinho.reduce((acc, item) => acc + item.getSubtotal(), 0);
    const resumo = carrinho.map(item => 
        `${item.quantidade}x ${item.nome} - R$ ${item.getSubtotal().toFixed(2)}`
    ).join('\n');
    
    alert(`🎉 Pedido Realizado com Sucesso!\n\n${resumo}\n\nTotal: R$ ${total.toFixed(2)}\n\nObrigado pela compra!`);
    
    carrinho = [];
    salvarCarrinho();
    renderCarrinho();
    atualizarContadorCarrinho();
}

// SALVAR NO LOCALSTORAGE
function salvarCarrinho() {
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

// NOTIFICAÇÃO
function mostrarNotificacao(mensagem) {
    const notif = document.createElement('div');
    notif.textContent = mensagem;
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #51cf66;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Animações CSS inline
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
