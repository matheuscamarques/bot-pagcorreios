
var JsonDB = require('node-json-db').JsonDB;
var Config = require('node-json-db/dist/lib/JsonDBConfig').Config
var fs = require("fs")

var db = new JsonDB(new Config("dados", true, false, '/'));
const puppeteer = require('puppeteer'); (async () => {


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

    const browser = await puppeteer.launch({ headless: true });
    await Login(browser, "", "")

    while (fila.length) {
        await PesquisaPorRemessa(browser, fila.pop())
    }


    await Logout(browser)
    await browser.close();

})();


// id username
// id password
/**
 * 
 * @param {puppeteer.Browser} browser 
 * @param {string} username 
 * @param {string} password 
 */
async function Login(browser, username, password) {
    const page = await browser.newPage();
    await page.goto('https://cas.correios.com.br/login');

    await page.type('#username', username);
    await page.type('#password', password);

    await page.screenshot({ path: 'passos/1-login.png' });

    // click and wait for navigation
    await Promise.all([
        page.click('button.primario'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);


    await page.screenshot({ path: 'passos/2-login.png' });
    await page.close();

}

/**
 * 
 * @param {puppeteer.Browser} browser 
 */
async function Logout(browser) {
    const page = await browser.newPage();
    await page.goto('https://cas.correios.com.br/logout');
    await page.screenshot({ path: 'passos/logout.png' });
    await page.close()
}

/**
 * 
 * @param {puppeteer.Browser} browser 
 */
async function PesquisaPorRemessa(browser, remessaID) {
    const page = await browser.newPage();
    await page.goto('https://apps.correios.com.br/portalimportador/pages/pesquisarRemessaImportador/pesquisarRemessaImportador.jsf');
    await page.screenshot({ path: 'passos/remessaERR.png' });
    await page.type('input[id="form-pesquisarRemessas:codigoEncomenda"]', remessaID);
    await Promise.all([
        page.click('input[id="form-pesquisarRemessas:btnPesquisar"]'),
    ]);
    await new Promise((resolve) => {
        setTimeout(() => console.log(remessaID, "Loanding Remessa", 500 + "ms", resolve(true)), 500)
    })


    await page.screenshot({ path: 'passos/remessa.png' });

    const result = await page.$$eval('#tableEncomendas', rows => {
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => {
                let data = []
                if (column.childNodes.length > 1) {
                    for (let i = 0; i < column.childNodes.length; i++) {
                        if (column.childNodes[i].id != null) {
                            if (column.childNodes[i].id.includes("iconeBoleto")) {
                                data = [column.childNodes[i].id];
                                var expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
                                var regex = new RegExp(expression);
                                let url = column.childNodes[i].getAttributeNode('onclick').nodeValue.match(regex)[1]
                                data = [url];

                                break
                            }

                            if (column.childNodes[i].id.includes("iconePagamento")) {
                                data = [column.childNodes[i].id]
                            }
                        }
                    }
                }

                if (data.length) return data
                if (column.innerText.length) return column.innerText
            });
        });
    });

    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
            if (Array.isArray(result[i][j])) {
                if (result[i][j][0].includes("meiosdepagamentobradesco")) {
                    result[i][j] = result[i][j][0]
                    continue;
                }

                if (result[i][j][0].includes("iconePagamento")) {
                    await page.click(`a[id="${result[i][j]}"]`);
                    await Sleep(3000)
                    page.click('input[id="formFormasPagamento:chkCiente"]')
                    page.click('input[id="formFormasPagamento:chkCiente"]')
                    page.click('input[id="formFormasPagamento:chkCiente"]')
                    await Sleep(3000)
                    page.click('input[id="formFormasPagamento:btnIrPagFacil"]')
                    await Sleep(3000)
                    await Sleep(3000)
                    await Sleep(3000)
                    await Sleep(3000)////*[@id="codigoBarras"]
                    await Sleep(3000)
                    await Sleep(3000)
                    await Sleep(3000)
                    await page.screenshot({ path: 'passos/iconne-pagamento.png' });
                    page.click('div[id="btn-pagar-com-boleto"]')
                    await page.screenshot({ path: 'passos/iconne-pagamento.png' });
                    result[i][j] = "tentativa de confirmar boleto"
                }

            }

        }
    }


    for (let i = result.length - 1; i >= 0; i--) {
        let obj = {}
        for (let j = result[i].length - 1; j >= 0; j--) {
            if (result[i][j] == null) continue
            let index = "-0"
            if (j == 0) index = "boleto"
            if (j == 1) index = "encomenda"
            if (j == 2) index = "documento"
            //if(j == 3) index = "base64"
            if (j == 4) index = "situacao"
            if (j == 5) index = "data"

            obj[index] = result[i][j]

        }

        db.push("/" + remessaID, obj)
    }
    await page.close()
}




async function Sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), ms)
    })
}