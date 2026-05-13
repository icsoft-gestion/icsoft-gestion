

const DB_NAME = "icsoft_db";
const DB_VERSION = 1;
const STORE_NAME = "licence";
const ESSAI_JOURS = 7;

// Ouvre la base IndexedDB
function ouvrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(STORE_NAME, { keyPath: "cle" });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror = () => reject("Erreur DB");
  });
}

// Lire une valeur
function lire(db, cle) {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(cle);
    req.onsuccess = () => resolve(req.result ? req.result.valeur : null);
    req.onerror = () => resolve(null);
  });
}

// Écrire une valeur
function ecrire(db, cle, valeur) {
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put({ cle, valeur });
    tx.oncomplete = () => resolve();
  });
}

// Vérification principale au chargement
async function verifierLicence() {
  const db = await ouvrirDB();
  const maintenant = Date.now();

  // Vérifier si une licence active existe
  const licenceData = await lire(db, "licence_active");
  if (licenceData) {
    const licence = JSON.parse(licenceData);
    if (maintenant < licence.expiration) {
      afficherApp(); // Licence valide
      return;
    } else {
      // Licence expirée
      await ecrire(db, "licence_active", null);
    }
  }

  // Vérifier la période d'essai
  let debutEssai = await lire(db, "debut_essai");
  if (!debutEssai) {
    // Premier lancement — démarrer l'essai
    await ecrire(db, "debut_essai", maintenant.toString());
    debutEssai = maintenant.toString();
  }

  const joursEcoules = (maintenant - parseInt(debutEssai)) / (1000 * 60 * 60 * 24);

  if (joursEcoules < ESSAI_JOURS) {
    afficherApp(); // Essai encore valide
  } else {
    afficherPageLicence(); // Essai terminé
  }
}

// Activer une licence avec la clé saisie
async function activerLicence() {
  const saisie = document.getElementById("input-licence").value.trim();
  const resultat = verifierCle(saisie);

  if (!resultat.valide) {
    document.getElementById("licence-message").textContent = "Clé invalide.";
    return;
  }

  const db = await ouvrirDB();
  const expiration = resultat.expiration;
  await ecrire(db, "licence_active", JSON.stringify({ expiration }));

  afficherApp();
}

// ============================================
// FORMAT DE CLÉ — CONNU DE TOI SEUL
// Structure : IC-XXXX-MMAA-YYYY
// XXXX = code client (4 lettres hash)
// MMAA = mois + année (ex: 0626 = juin 2026)
// YYYY = checksum calculé
// ============================================
function verifierCle(saisie) {
  try {
    const parties = saisie.toUpperCase().split("-");
    if (parties.length !== 4) return { valide: false };
    if (parties[0] !== "IC") return { valide: false };

    const mmaa = parties[2];
    if (mmaa.length !== 4) return { valide: false };

    const mois = parseInt(mmaa.substring(0, 2));
    const annee = parseInt("20" + mmaa.substring(2, 4));
    if (mois < 1 || mois > 12) return { valide: false };

    // Vérifier le checksum
    const codeClient = parties[1];
    const checksumAttendu = calculerChecksum(codeClient, mmaa);
    if (parties[3] !== checksumAttendu) return { valide: false };

    // Calculer la date d'expiration (fin du mois)
    const expiration = new Date(annee, mois, 1).getTime(); // 1er du mois suivant

    // Vérifier que la clé est pour le mois en cours ou futur
    const maintenant = new Date();
    const debutMoisCle = new Date(annee, mois - 1, 1).getTime();
    if (debutMoisCle < new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).getTime()) {
      return { valide: false }; // Clé d'un mois passé
    }

    return { valide: true, expiration };
  } catch {
    return { valide: false };
  }
}

// Calcul du checksum (algorithme secret)
function calculerChecksum(codeClient, mmaa) {
  const base = codeClient + mmaa;
  let val = 0;
  for (let i = 0; i < base.length; i++) {
    val = (val * 31 + base.charCodeAt(i)) % 9973;
  }
  return val.toString(36).toUpperCase().padStart(4, "0").substring(0, 4);
}

function afficherApp() {
  document.getElementById("page-licence").style.display = "none";
  document.getElementById("page-accueil").style.display = "block";
}

function afficherPageLicence() {
  document.getElementById("page-licence").style.display = "flex";
  document.getElementById("page-accueil").style.display = "none";
}

window.onload = verifierLicence;