const canvas = document.getElementById("roleta");
const ctx = canvas.getContext("2d");

const btnAdicionar = document.getElementById("adicionar");
const btnGirar = document.getElementById("girar");
const input = document.getElementById("novaOpcao");
const lista = document.getElementById("listaOpcoes");
const resultado = document.getElementById("resultado");

const btnAbrirModal = document.getElementById("abrirModal");
const btnCancelar = document.getElementById("cancelar");
const btnFecharResultado = document.getElementById("fecharResultado");
const modalAdicionar = document.getElementById("modalAdicionar");
const modalResultado = document.getElementById("modalResultado");

const somFundo = document.getElementById("somFundo");
const btnToggleSom = document.getElementById("toggleSom");

const btnToggleTema = document.getElementById("toggleTema");

somFundo.volume = 0.3;

let somLigado = false;

function alternarSom() {

    if (somLigado) {
        somFundo.pause();
        btnToggleSom.textContent = "🔇";
    } else {
        somFundo.play().catch(() => {});
        btnToggleSom.textContent = "🔊";
    }

    somLigado = !somLigado;

    localStorage.setItem("somLigado", somLigado);

}

btnToggleSom.addEventListener("click", alternarSom);

let opcoes = [
    "Minions piratex",
    "alburgui",
    "açai"
];

let anguloAtual = 0;
let girando = false;

const cores = [
    "#FF6B6B",
    "#4ECDC4",
    "#FFD166",
    "#6A4C93",
    "#06D6A0",
    "#F3722C",
    "#577590",
    "#EF476F"
];

function ajustarCanvas() {

    const dpr = window.devicePixelRatio || 1;
    const tamanhoCSS = canvas.clientWidth;

    canvas.width = tamanhoCSS * dpr;
    canvas.height = tamanhoCSS * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    desenharRoleta();
}

function desenharRoleta() {

    const raio = canvas.clientWidth / 2;
    const setor = (Math.PI * 2) / opcoes.length;

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    ctx.save();

    ctx.translate(raio, raio);
    ctx.rotate(anguloAtual);

    for (let i = 0; i < opcoes.length; i++) {

        const inicio = i * setor;
        const fim = inicio + setor;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, raio - 5, inicio, fim);
        ctx.closePath();

        ctx.fillStyle = cores[i % cores.length];
        ctx.fill();

        ctx.save();

        ctx.rotate(inicio + setor / 2);

        ctx.fillStyle = "#FFF";
        ctx.font = `bold ${Math.max(12, raio * 0.07)}px Arial`;
        ctx.textAlign = "right";
        ctx.fillText(opcoes[i], raio - 20, 6);

        ctx.restore();
    }

    ctx.restore();
}

function atualizarLista() {

    lista.innerHTML = "";

    opcoes.forEach((opcao, index) => {

        const li = document.createElement("li");

        const span = document.createElement("span");
        span.textContent = opcao;

        const btnRemover = document.createElement("button");
        btnRemover.textContent = "✕";
        btnRemover.className = "btn-remover";
        btnRemover.setAttribute("aria-label", `Remover ${opcao}`);

        btnRemover.addEventListener("click", () => {
            removerOpcao(index);
        });

        li.appendChild(span);
        li.appendChild(btnRemover);

        lista.appendChild(li);

    });

    desenharRoleta();
}

function removerOpcao(index) {

    if (opcoes.length <= 2) {
        alert("É preciso ter pelo menos 2 opções na roleta.");
        return;
    }

    opcoes.splice(index, 1);

    atualizarLista();

}

function aplicarTema(tema) {

    if (tema === "escuro") {
        document.documentElement.setAttribute("data-tema", "escuro");
        btnToggleTema.textContent = "☀️";
    } else {
        document.documentElement.removeAttribute("data-tema");
        btnToggleTema.textContent = "🌙";
    }

    localStorage.setItem("tema", tema);

}

btnToggleTema.addEventListener("click", () => {

    const temaAtual = document.documentElement.getAttribute("data-tema");

    aplicarTema(temaAtual === "escuro" ? "claro" : "escuro");

});

btnAbrirModal.addEventListener("click", () => {
    modalAdicionar.classList.add("ativo");
    input.focus();
});

btnCancelar.addEventListener("click", () => {
    modalAdicionar.classList.remove("ativo");
    input.value = "";
});

btnFecharResultado.addEventListener("click", () => {
    modalResultado.classList.remove("ativo");
});

btnAdicionar.addEventListener("click", () => {

    const texto = input.value.trim();

    if (!texto) return;

    opcoes.push(texto);

    input.value = "";

    atualizarLista();

    modalAdicionar.classList.remove("ativo");

});

btnGirar.addEventListener("click", () => {

    if (girando) return;

    girando = true;

    const setor = (Math.PI * 2) / opcoes.length;

    // Entre 8 e 16 voltas + um extra aleatório (não mira em nenhum índice específico)
    const voltas = (8 + Math.random() * 8) * Math.PI * 2;
    const extraAleatorio = Math.random() * Math.PI * 2;

    const inicio = anguloAtual;
    const destino = inicio + voltas + extraAleatorio;

    const duracao = 7000;

    let inicioTempo = null;

    function animar(tempo) {

        if (!inicioTempo) inicioTempo = tempo;

        const progresso = (tempo - inicioTempo) / duracao;

        if (progresso < 1) {

            const ease = 1 - Math.pow(1 - progresso, 4);

            anguloAtual = inicio + (destino - inicio) * ease;

            desenharRoleta();

            requestAnimationFrame(animar);

        } else {

            anguloAtual = destino % (Math.PI * 2);

            desenharRoleta();

            // Descobre qual fatia realmente parou sob o ponteiro (topo do círculo)
            const anguloPonteiro = -Math.PI / 2;

            let localAnguloNoPonteiro = anguloPonteiro - anguloAtual;
            localAnguloNoPonteiro = ((localAnguloNoPonteiro % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

            let indiceSorteado = Math.floor(localAnguloNoPonteiro / setor);
            indiceSorteado = Math.min(indiceSorteado, opcoes.length - 1);

            resultado.textContent = `❤️ ${opcoes[indiceSorteado]}`;

            modalResultado.classList.add("ativo");

            girando = false;

        }

    }

    requestAnimationFrame(animar);

});


const somSalvo = localStorage.getItem("somLigado");

if (somSalvo === "true") {
    btnToggleSom.textContent = "🔊";
    // Não damos play automático aqui — precisa de interação do usuário
    // Vamos tocar assim que o usuário interagir com a página pela primeira vez
    somLigado = false;

    const iniciarSomNoPrimeiroClique = () => {
        somFundo.play().catch(() => {});
        somLigado = true;
        document.removeEventListener("click", iniciarSomNoPrimeiroClique);
    };

    document.addEventListener("click", iniciarSomNoPrimeiroClique);
}


window.addEventListener("resize", ajustarCanvas);

const temaSalvo = localStorage.getItem("tema") || "claro";
aplicarTema(temaSalvo);

ajustarCanvas();
atualizarLista();