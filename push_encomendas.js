var JsonDB = require('node-json-db').JsonDB;
var Config = require('node-json-db/dist/lib/JsonDBConfig').Config
var encomendas = new JsonDB(new Config("entrada_encomendas", true, false, '/'));

let fila = [
    "UU202812886CN",
    "UU201794090CN",
    "UU201584051CN",
    "UU201670617CN",
    "UU201573677CN",
    "UU201657964CN",
    "UU201809846CN",
    "UU201598104CN",
    "UU201595195CN",
    "UU202809564CN",
    "UU201224623CN",
    "UU202504681CN",
    "UU201849235CN",
    "UU202814122CN",
    "UU201662880CN",
    "UU202822849CN",
    "UU203166680CN",
    "UU202819725CN",
    "UU202816565CN",
    "UU202867434CN",
    "UU201598104CN"
]

encomendas.push("/", fila);