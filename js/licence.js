
const CLE_MAITRE = "ICSOFT-IVAN-2026";

function verifierLicence() {
    // Attendre que IndexedDB soit ouvert
    const request = indexedDB.open("ICSoftBoutique");
    request.onsuccess = function() {
        _verifierLicence();
    };
    request.onerror = function() {
        _verifierLicence(); // continuer même si erreur
    };
}



function verifierLicence() {
    const cle = localStorage.getItem("icsoft_licence");

    // Licence déjà activée → accès direct
    if (cle && cle === CLE_MAITRE) {
        afficherApp();
        return;
    }

    // Gestion essai 7 jours
    let debut = localStorage.getItem("icsoft_essai_debut");
    if (!debut) {
        debut = new Date().getTime();
        localStorage.setItem("icsoft_essai_debut", debut);
    }

    const maintenant = new Date().getTime();
    const joursEcoules = Math.floor((maintenant - parseInt(debut)) / (1000 * 60 * 60 * 24));
    const joursRestants = 7 - joursEcoules;

    if (joursEcoules >= 7) {
        // Essai terminé → bloquer
        document.getElementById("page-licence").style.display = "block";
        document.getElementById("page-accueil").style.display = "none";
    } else {
        // Encore en essai → laisser entrer + afficher message
        afficherApp();
        const msg = document.createElement("div");
        msg.style.cssText = "position:fixed; bottom:10px; right:10px; background:#f0a500; color:#0a1628; padding:8px 14px; border-radius:8px; font-weight:bold; z-index:9999;";
        msg.textContent = "⏳ Essai : " + joursRestants + " jour(s) restant(s)";
        document.body.appendChild(msg);
    }
}

function activerLicence() {
    const saisie = document.getElementById("input-licence").value.trim();
    if (saisie === CLE_MAITRE) {
        localStorage.setItem("icsoft_licence", saisie);
        afficherApp();
        alert("✅ Licence activée !");
    } else {
        alert("❌ Clé invalide !");
    }
}

function afficherApp() {
    document.getElementById("page-licence").style.display = "none";
    document.getElementById("page-accueil").style.display = "block";
}

window.onload = verifierLicence;
