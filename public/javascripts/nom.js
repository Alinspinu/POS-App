const nomenclator = document.querySelector('.nomenclator')
const produsLink = nomenclator.querySelectorAll('li')
const searchBar = document.getElementById('cauta');
const list = document.getElementById('list');



produsLink.forEach(function(item) {
  item.addEventListener('click', function() {
    let link = item.querySelector('a');
    window.location = link.href;
  });
});


searchBar.addEventListener('input', function() {
  let searchTerm = this.value.toLowerCase();
  Array.from(produsLink).forEach(function(item) {
    let itemText = item.textContent;
    if (itemText.toLowerCase().indexOf(searchTerm) != -1) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
});

