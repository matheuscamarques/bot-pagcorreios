let CorreiosScrapping = require('./correios_scrapping');

var JsonDB = require('node-json-db').JsonDB;
var Config = require('node-json-db/dist/lib/JsonDBConfig').Config
var fetch = require('node-fetch');
var FileReader = require('filereader')

var dados = new JsonDB(new Config("dados", true, false, '/'));
var pagamento = new JsonDB(new Config("pagamento_encomendas", true, false, '/'));
var entrada_encomendas = new JsonDB(new Config("entrada_encomendas", true, false, '/'));
var base64_encomendas =  new JsonDB(new Config("base64_encomendas", true, false, '/'));

(async () => {
    await CorreiosScrapping();
    ExtrairAguardandoPagamento()
    await GerarEncomendasBase64()
})();


async function ExtrairCodigoDeBarras(){
    let encomendas = base64_encomendas.getData('/');
    for (let index in encomendas) {
        //

    }
}

async function GerarEncomendasBase64(){

    let encomendas = pagamento.getData('/');
    for (let index in encomendas) {
        let encomenda = encomendas[index];
        let url_pdf = "https://"+encomenda.boleto
        // use url_pdf dowload and genarate base64
        await fetch(url_pdf)
            .then(res => res.buffer())
            .then(buffer => {
                let base64 = buffer.toString('base64');
                //console.log(base64)
                encomenda['base64'] = base64;
                base64_encomendas.push('/' + index, encomenda);
            }
        );
    }
}

function ExtrairAguardandoPagamento(){
    let encomendas = dados.getData('/');
    for (let index in encomendas) {
        let encomenda = encomendas[index];
        if (encomenda['situacao'] == "Aguardando Pagamento") {
            pagamento.push('/' + index, encomenda);
            removeEntrada(index)
            continue
        }
        removeEntrada(index)
    }
}

function removeEntrada(encomenda) {
    let entradas = entrada_encomendas.getData('/');
 
    for (let i = entradas.length; i >= 0; i--) {
        if (entradas[i] == encomenda) {
            entradas.splice(i, 1);
        }
    }
    
    entrada_encomendas.push('/', entradas);
}