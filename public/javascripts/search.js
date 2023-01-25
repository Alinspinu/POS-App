
const searchWrapper = document.querySelector('.search-input');
const inputBox = searchWrapper.querySelector('input');
const suggBox = searchWrapper.querySelector('.autocom-box');
const bill = document.querySelector('.bill')
const nota = document.querySelector('.nota')
const nto = document.querySelector('.nto')
const card = document.querySelector('#card')
const cash = document.querySelector('#cash');
const redRow = document.querySelector('.reducere');
const reducereInput = redRow.querySelector('input');
const raportZ = document.querySelector('.z')
const raportX = document.querySelector('.x')
const urlLocal = 'http://localhost:3000/produseApi'
const urlLocalSend = 'http://localhost:3000/notaApi'

// sessionStorage.removeItem('data')


if(!sessionStorage.data){
    fetch(urlLocal).then(res => res.json()).then((data) => {
        sessionStorage.setItem('data', JSON.stringify(data))
    })
} 

const produse = JSON.parse(sessionStorage.getItem('data'))

inputBox.onkeyup = (e) => {
    let emptyArray = [];
    let userData = e.target.value;
    if (userData) {
        emptyArray = produse.filter((data) => {
            return data.toLocaleLowerCase().includes(userData.toLocaleLowerCase());
        })
        emptyArray = emptyArray.map((data) => {
            return data = '<li>' + data + '</li>'
        })
        searchWrapper.classList.add('active')
        showSugestions(emptyArray);
        const allList = suggBox.querySelectorAll('li')
        for (let i = 0; i < allList.length; i++) {
            allList[i].setAttribute("onclick", "select(this)")
        }
    } else {
        searchWrapper.classList.remove('active')
    }
}

// Get element for search and append to bill preview
function select(element) {
    let selectUserData = element.textContent;
    const produsNume = selectUserData.slice(0, -8).replace('|', '')
    const produsPret = selectUserData.slice(-7, -4).replace('|', '')
    const billRow = document.createElement('div');
    billRow.classList.add('row', 'rand', 'my-2', 'mx-1');
    const billRowContent =
    `<span class="col-lg-5 fs-5 produs">${produsNume}</span>
    <span class="col-lg-3 fs-5 pret">${produsPret} lei</span>
    <button class="col-lg-1 minus btn btn-outline-warning" >-</button>
    <input type="text" class="col-lg-1 mx-1 qty" value="1">
    <button class="col-lg-1 plus btn btn-outline-warning">+</button>`;
    billRow.innerHTML = billRowContent;
    bill.append(billRow);
    updateCartTotal()

    //change the quatity buttons
    const input = billRow.getElementsByClassName('qty')[0]
    billRow.getElementsByClassName('plus')[0].onclick = (e) => {
        input.value = Number(input.value)+1 
        const event = new Event('change', {bubbles: true});
        input.dispatchEvent(event)
    }
    billRow.getElementsByClassName('minus')[0].onclick = (e) => {
        input.value = Number(input.value)-1
        const event = new Event('change', {bubbles: true});
        input.dispatchEvent(event)
        if(input.value <= 0){
            removeItem(e)
        }
    }
    input.addEventListener('change', quantityChanged)
    inputBox.value = ''
    searchWrapper.classList.remove('active')
}

//Open and display payment methods
nto.addEventListener('click', (e) => {
    const total = document.querySelector('#total').innerText.replace('lei','')
    document.querySelector('.modal-pret').innerText = `${total}`
    document.querySelector('#card').value = ''
    document.querySelector('#cash').value = ''
})


// const resetBtn = document.querySelector('.reset') 
// resetBtn.addEventListener('click', (e) => {
//     localStorage.removeItem('cash')
//     localStorage.removeItem('card')
// })

let cashTotal = localStorage.getItem('cash');
let cardTotal = localStorage.getItem('card');
nota.addEventListener('click', (e) => {
    const produsRow = document.querySelectorAll('.rand')
    const total = document.querySelector('#total').innerText.replace(' lei','')
    const card = document.querySelector('#card')
    const cash = document.querySelector('#cash')
    const navCash = document.querySelector('.nav-cash')
    const navCard = document.querySelector('.nav-card')
    const navTot = document.querySelector('.card-cash')
    const reducere = reducereInput.value
    if(parseFloat(total) == parseFloat(cash.value) + parseFloat(card.value)){
        let produse = []
        for (let i = 0; i < produsRow.length; i++) {
            const produsNume = produsRow[i].getElementsByClassName('produs')[0].innerText
            const produsPret = produsRow[i].getElementsByClassName('pret')[0].innerText.replace(' lei','')
            const produsQty = produsRow[i].getElementsByClassName('qty')[0].value
            let data = { produs: produsNume, pret: produsPret, qty: produsQty }
            produse.push(data)
            if(cardTotal === null || cardTotal === undefined){
                cardTotal = 0
            }
            if(cashTotal === null || cashTotal === undefined){
                cashTotal = 0
            }
            cashTotal = parseFloat(cashTotal)
            cardTotal = parseFloat(cardTotal)
            cashTotal += parseFloat(cash.value)
            cardTotal += parseFloat(card.value)
            localStorage.setItem('cash', cashTotal)
            localStorage.setItem('card', cardTotal)
            navCard.innerText = `${cardTotal}`
            navCash.innerText = `${cashTotal}`
            navTot.innerText = `${cashTotal+cardTotal}`
            produsRow[i].remove()
        }
        reducereInput.value = ''
        updateCartTotal()
        //send the bill to the server to create a bill file
        fetch(urlLocalSend, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({produse: produse, cash: cash.value, card: card.value, reducere: reducere })
        })

    } else {
        alert('Valoarea nu corespunde cu totalul bonului mai încearcă odată :))')
        
    }
})

raportX.addEventListener('click', (e) => {
    fetch(urlLocalSend, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({raport: 'x' })
    })
})

raportZ.addEventListener('click', (e) => {
    fetch(urlLocalSend, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({raport: 'z' })
    })
})

card.onkeyup = (e)=>{
    const modalTotal = document.querySelector('.modal-pret')
    const num = document.querySelector('#cash')
    const total = document.querySelector('#total').innerText.replace(' lei','')
    const val = e.target
    const value = val.value
    if(value < 0 || isNaN(value) || value > parseFloat(total) || value + num.value > total) {
        val.value = ''
        alert('Suma plătită nu poate fi mai mare decat nota de plată')
    }else if(!num.value || num.value == 0){
        modalTotal.innerText = total - value
    }else {
        modalTotal.innerText = total-value-num.value
    }
}
cash.onkeyup = (e) => {
    const modalTotal = document.querySelector('.modal-pret')
    const crd = document.querySelector('#card')
    const total = document.querySelector('#total').innerText.replace(' lei','')
    const value = e.target
    if(value.value < 0 || isNaN(value.value) || value.value > parseFloat(total)) {
        value.value = 0
        alert('Suma plătită nu poate fi mai mare decat nota de plată')
    } else if(!crd.value || crd.value == 0){
        modalTotal.innerText = total - value.value
    } else{
        modalTotal.innerText = total-value.value-crd.value
    }
}

const cashBtn = document.querySelector('.cash');
    cashBtn.addEventListener('click', (e) =>{
        const crd = document.querySelector('#card')
        const num = document.querySelector('#cash')
        const modalTotal = document.querySelector('.modal-pret')
        const total = document.querySelector('#total').innerText.replace(' lei','')
        if(parseFloat(crd.value) <= parseFloat(total)) {
            num.value = total - crd.value;
            modalTotal.innerText = 0
        }else{
            num.value = total  
            crd.value = 0
            modalTotal.innerText = 0
        };
    })

const cardBtn = document.querySelector('.car')
    cardBtn.addEventListener('click', (e)=>{
        const num = document.querySelector('#cash')
        const crd = document.querySelector('#card')
        const modalTotal = document.querySelector('.modal-pret')
        const total = document.querySelector('#total').innerText.replace(' lei','')
        if(parseFloat(num.value) <= parseFloat(total)){
            crd.value = total - num.value;
            modalTotal.innerText = 0
        }else{
            crd.value = total
            num.value = 0
            modalTotal.innerText = 0
        };
    })

//handle discount input
reducereInput.onkeyup = (e) => {
    const value = e.target.value
    if(isNaN(value) || value < 0){
        reducereInput.value = ''
    }
    updateCartTotal()
    
}


//Show search results
function showSugestions(list) {

    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = '<li>' + userValue + '</li>'
    } else {
        listData = list.join('');
    }
    suggBox.innerHTML = listData;
}


//Handle the bill previw
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    //change quantity of item from bill
    const produse = document.querySelectorAll('.rand')
    const qtyImputs = document.getElementsByClassName('qty')
    for (let i = 0; i < produse.length; i++) {
        const produsRow = produse[i];
        const input = produsRow.getElementsByClassName('qty')[0]
        input.addEventListener('change', quantityChanged)
    }
}

// Chage quantity function
function quantityChanged(e) {
    const input = e.target
    if (isNaN(input.value)) {
        input.value = 1
    }
    updateCartTotal();
}
// Remove item function
function removeItem(e) {
    e.target.parentElement.remove();
    updateCartTotal();
}

//Update cart total function
function updateCartTotal() {
    const produse = document.querySelectorAll('.rand')
    let total = 0;
    for (let i = 0; i < produse.length; i++) {
        const cartRow = produse[i];
        const priceElement = cartRow.getElementsByClassName('pret')[0]
        const qtyElement = cartRow.getElementsByClassName('qty')[0]
        let qty = qtyElement.value
        const price = parseFloat(priceElement.innerText.replace('lei', ''))
        total = total + (qty * price);
    }
    if(total < reducereInput.value){
        total = total
    } else {
    total = total - reducereInput.value
    }
    document.querySelector('#total').innerText = total + ' lei'
}


