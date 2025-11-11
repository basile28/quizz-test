/* admin.js */
const ADMIN_PASSWORD = "123";
const adminLogin = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const profilesContainer = document.getElementById("profiles-container");

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-admin-login").addEventListener("click", async () => {
    const pwd = document.getElementById("admin-password").value;
    if(pwd !== ADMIN_PASSWORD) return alert("Mot de passe incorrect !");
    adminLogin.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    await afficherProfiles();
  });

  document.getElementById("btn-reinit").addEventListener("click", async () => {
    if(!confirm("Réinitialiser toutes les stats ?")) return;
    await fetch("save_stats.php?reset=1");
    await afficherProfiles();
    alert("Réinitialisé.");
  });

  document.getElementById("btn-export").addEventListener("click", async () => {
    const res = await fetch("load_stats.php");
    const data = await res.json();
    let csv = "Profil,Type,Nom,Bonnes,Mauvaises\n";
    for(const profil in data) {
      const s = data[profil];
      for(const d in s.departements) {
        const v = s.departements[d];
        csv += `${profil},departement,${d},${v.bonnes},${v.mauvaises}\n`;
      }
      for(const c in s.capitales) {
        const v = s.capitales[c];
        csv += `${profil},capitale,${c},${v.bonnes},${v.mauvaises}\n`;
      }
    }
    const blob = new Blob([csv], {type: "text/csv"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stats_quiz.csv";
    a.click();
  });
});

async function afficherProfiles() {
  profilesContainer.innerHTML = "";
  const res = await fetch("load_stats.php");
  const data = await res.json();
  const profiles = Object.keys(data);
  if(profiles.length === 0) {
    profilesContainer.innerHTML = "<p>Aucun profil enregistré.</p>";
    return;
  }

  profiles.forEach(profil => {
    const s = data[profil];
    const departements = s.departements || {};
    const capitales = s.capitales || {};
    const bonnesDept = Object.values(departements).reduce((a,b)=>a+(b.bonnes||0),0);
    const mauvaisesDept = Object.values(departements).reduce((a,b)=>a+(b.mauvaises||0),0);
    const bonnesCap = Object.values(capitales).reduce((a,b)=>a+(b.bonnes||0),0);
    const mauvaisesCap = Object.values(capitales).reduce((a,b)=>a+(b.mauvaises||0),0);

    const card = document.createElement("div");
    card.className = "admin-profile-card";
    card.innerHTML = `
      <h3>${profil}</h3>
      <p>Départements: ${bonnesDept} ✅ / ${mauvaisesDept} ❌</p>
      <p>Capitales: ${bonnesCap} ✅ / ${mauvaisesCap} ❌</p>
      <button class="btn-reset" data-nom="${profil}">Réinitialiser</button>
      <button class="btn-suppr" data-nom="${profil}">Supprimer</button>
    `;
    profilesContainer.appendChild(card);
  });

  // events
  document.querySelectorAll(".btn-reset").forEach(btn => {
    btn.addEventListener("click", async () => {
      const p = btn.dataset.nom;
      if(!confirm(`Réinitialiser ${p} ?`)) return;
      await fetch("save_stats.php", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({profil:p, departements:{}, capitales:{}})
      });
      await afficherProfiles();
    });
  });

  document.querySelectorAll(".btn-suppr").forEach(btn => {
    btn.addEventListener("click", async () => {
      const p = btn.dataset.nom;
      if(!confirm(`Supprimer ${p} ?`)) return;
      // load all, remove key, save full file
      const res = await fetch("load_stats.php");
      const data = await res.json();
      delete data[p];
      await fetch("save_stats.php", {
        method:"POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({__full_replace: true, data})
      });
      await afficherProfiles();
    });
  });
}
