const express = require('express');
const path = require('path')
const mongoose = require('mongoose')
const app = express();
const ejsMate = require('ejs-mate')
const session = require('express-session');
const MongoDbStore = require('connect-mongo');
const methodOverride = require('method-override');
const Produs = require('./models/produs')
const localStorage = require('local-storage');
const bodyParser = require('body-parser');
var fs = require('fs');
const produs = require('./models/produs');

mongoose.set('strictQuery', false)

const dbUrl = 'mongodb+srv://Alin:espsOCn7sllc@cluster0.m2r9yun.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(dbUrl);


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const sessionConfig = {
    store: MongoDbStore.create({
        mongoUrl: dbUrl,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.get('/', async(req, res, next)=>{
    res.render('search')
})
let nume = []
app.get('/produseApi', async(req, res, next) => {
    const produse = await Produs.find({})
    produse.forEach(function(produs){
        nume.push(`${produs.nume} | ${produs.pret} lei`)
        localStorage('nume', nume)
    })
    const num = localStorage('nume')
    res.json(num)
})

app.get('/addProdus', (req, res) => {
    res.render('addProdus')
})

app.get('/nomenclator', async(req, res, next) => {
    const produse = await Produs.find({})
    produse.sort((a,b) => (a.nume > b.nume) ? 1 : ((b.nume > a.nume) ? -1 : 0));
    res.render('nomenclator', {produse})
})

app.get('/modifica/:id', async(req, res, next) => {
    const produs = await Produs.findById(req.params.id)
    res.render('modifica', {produs})
})

app.put('/modifica/:id', async(req, res , next)=> {
    const { id } = req.params;
    const produsNou = await Produs.findByIdAndUpdate(id, { ...req.body.produs })
    await produsNou.save()
    console.log(produsNou)
    // req.flash(`Ai modificat cu succes categoria ${catNou.name}`)
    res.redirect('/nomenclator')
})

app.post('/produs', async(req, res, next) => {
    const produs = new Produs(req.body.produs)
    await produs.save()
    console.log(produs)
    res.redirect('/addProdus')
})

app.post('/notaApi', (req, res, next) => {
    let nota = []
    if(req.body.raport){
        let raport = req.body.raport === 'x' ? 0 : 1
        nota.push(`Z,1,______,_,__;${raport};`)
    }else{
    const data = req.body.produse
    const cash = parseFloat(req.body.cash)
    const card = parseFloat(req.body.card)
    const red = parseFloat(req.body.reducere)
    for(let i=0; i<data.length; i++){
        const produs = `S,1,______,_,__;${data[i].produs};${data[i].pret};${data[i].qty};1;1;5;0;0;buc`
        nota.push(produs);
    }
    if(red){
        nota.push('T,1,______,_,__;4;;;;;')
        nota.push(`C,1,______,_,__;3;${red};;;;`)
    } 
    if(cash > 0 && card >0){
        const totalNotaCash = `T,1,______,_,__;0;${cash};;;;`
        const totalNotaCard = `T,1,______,_,__;1;${card};;;;`
        nota.push(totalNotaCash, totalNotaCard)
    } if(cash == 0 || cash == isNaN || !cash){
        const totalNotaCard = `T,1,______,_,__;1;${card};;;;`
        nota.push(totalNotaCard)
    } if(card == 0 || card == isNaN || !card){
        const totalNotaCash = `T,1,______,_,__;0;${cash};;;;` 
        nota.push(totalNotaCash)
    }
}
    // const fileName = 'nota'
    // fs.writeFileSync(fileName, nota.join('\n'));
    res.json(nota)
})

const port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})