const CLE_MAITRE = "ICSOFT-IVAN-2026";

function verifierLicence() {
  const cle = localStorage.getItem("icsoft_licence");
  if (!cle || cle !== CLE_MAITRE) {
    document.getElementById("page-licence").style.display = "block";
    document.getElementById("page-accueil").style.display = "none";
  }
}

function activerLicence() {
  const saisie = document.getElementById("input-licence").value.trim();
  if (saisie === CLE_MAITRE) {
    localStorage.setItem("icsoft_licence", saisie);
    document.getElementById("page-licence").style.display = "none";
    document.getElementById("page-accueil").style.display = "block";
  } else {
    alert("Clé invalide !");
  }
}

window.onload = verifierLicence;
