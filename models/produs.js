const mongoose = require('mongoose')
const Schema = mongoose.Schema;




const produsSchema = new Schema({
    nume: String,
    um: String,
    pret: String,
    departament: String,
    ingrediente: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Ingrediente'
        }
    ]

})




module.exports = mongoose.model('Produs', produsSchema)