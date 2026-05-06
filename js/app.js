function allerVers(pageId) {
  document.getElementById('page-accueil').style.display = 'none';
  document.getElementById('page-historique').style.display = 'none';
  document.getElementById(pageId).style.display = 'block';
}

