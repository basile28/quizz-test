
// --- Variables et données déjà définies ---
let profil = "";
let departementStats = {};
let capitaleStats = {};
let currentQuestion = null;
let currentType = null;

// --- Sélecteurs ---
const profilSection = document.getElementById("profil-section");
const menuJeux = document.getElementById("menu-jeux");
const quizSection = document.getElementById("quiz-section");
const questionEl = document.getElementById("question");
const reponseEl = document.getElementById("reponse");
const correctionEl = document.getElementById("correction");

// --- Profil ---
document.getElementById("btn-profil").addEventListener("click", () => {
    const input = document.getElementById("profil").value.trim();
    if(!input) return alert("Entrez un profil !");
    profil = input;

    const saved = localStorage.getItem("stats_" + profil);
    if(saved){
        const stats = JSON.parse(saved);
        departementStats = stats.departements || {};
        capitaleStats = stats.capitales || {};
    } else {
        departementStats = {};
        capitaleStats = {};
    }

    profilSection.classList.add("hidden");
    menuJeux.classList.remove("hidden");
});

// --- Menu ---
document.getElementById("btn-departements").addEventListener("click", () => startQuiz("departement"));
document.getElementById("btn-capitales").addEventListener("click", () => startQuiz("capitale"));
document.getElementById("btn-suivant").addEventListener("click", () => startQuiz(currentType));
document.getElementById("btn-retour").addEventListener("click", () => {
    quizSection.classList.add("hidden");
    menuJeux.classList.remove("hidden");
});
document.getElementById("btn-stats").addEventListener("click", showStats);
document.getElementById("btn-stats-retour")?.addEventListener("click", () => {
    document.getElementById("stats-section").classList.add("hidden");
    menuJeux.classList.remove("hidden");
});
document.getElementById("btn-quit").addEventListener("click", () => {
    if(confirm("Voulez-vous vraiment quitter le site ?")){
        window.location.href = "https://www.google.com";
    }
});

// --- Bouton Valider corrigé ---
const btnValider = document.getElementById("btn-valider");
btnValider.addEventListener("click", validerReponse);
reponseEl.addEventListener("keydown", (e) => { if(e.key==="Enter") validerReponse(); });

function startQuiz(type){
    currentType = type;
    menuJeux.classList.add("hidden");
    quizSection.classList.remove("hidden");
    reponseEl.value = "";
    correctionEl.textContent = "";

    if(type==="departement"){
        const keys = Object.keys(dp);
        currentQuestion = keys[Math.floor(Math.random()*keys.length)];
        questionEl.textContent = `Quel est le nom du département n°${currentQuestion} ?`;
    } else {
        const keys = Object.keys(paysCapitales);
        currentQuestion = keys[Math.floor(Math.random()*keys.length)];
        questionEl.textContent = `Quelle est la capitale de ${currentQuestion} ?`;
    }
}

function validerReponse(){
    if(!currentQuestion) return;
    const answer = reponseEl.value.trim();
    if(!answer){ alert("Veuillez entrer une réponse !"); return; }

    let correct = false;

    if(currentType==="departement"){
        const deptName = dp[currentQuestion];
        correct = (answer.toLowerCase() === deptName.toLowerCase());
        if(!departementStats[deptName]) departementStats[deptName]={bonnes:0,mauvaises:0};
        departementStats[deptName][correct?"bonnes":"mauvaises"]++;
    } else {
        const capName = paysCapitales[currentQuestion];
        correct = (answer.toLowerCase() === capName.toLowerCase());
        if(!capitaleStats[capName]) capitaleStats[capName]={bonnes:0,mauvaises:0};
        capitaleStats[capName][correct?"bonnes":"mauvaises"]++;
    }

    correctionEl.textContent = correct ? "✅ Bonne réponse !" :
        `❌ Mauvaise réponse. C'était : ${currentType==="departement"?dp[currentQuestion]:paysCapitales[currentQuestion]}`;

    reponseEl.value = "";
    reponseEl.focus();

    sauvegarderStats();
}

function sauvegarderStats(){
    const stats = {departements: departementStats, capitales: capitaleStats};
    localStorage.setItem("stats_" + profil, JSON.stringify(stats));
}

function showStats(){
    menuJeux.classList.add("hidden");
    document.getElementById("stats-section").classList.remove("hidden");

    const container = document.getElementById("stats-cards");
    container.innerHTML = "";

    const type = "departement"; // Pour exemple, peut faire onglets
    const statsData = type==="departement"?departementStats:capitaleStats;
    for(const key in statsData){
        const s = statsData[key];
        const card = document.createElement("div");
        card.className = "stats-card";
        card.innerHTML = `<h3>${key}</h3>
            <div class="bar-container">
                <div class="bar bonnes" style="width:${s.bonnes*10}px;"></div>
                <div class="bar mauvaises" style="width:${s.mauvaises*10}px;"></div>
            </div>
            <p>✅ ${s.bonnes} - ❌ ${s.mauvaises}</p>`;
        container.appendChild(card);
    }
}
