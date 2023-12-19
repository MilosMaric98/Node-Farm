const fs = require('fs') // fs - modul za citanje i pisanje podataka u file system
const http = require('http') // http - gives us Network capability
const url = require('url') // - koristi se za analiziranje URL-a

const replaceTemplate = require('./modules/replaceTemplate')

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8') // __dirname - direktorijum u kom je script koji se trenutno izvrsava smesten
// ne mora asynchrono zato sto se ovaj kod izvrsva samo jednom
//samo jednom ucitavamo podatke i posle pozivamo da ne bi ucitavali svaki put
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8') // ucitava se template
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8')
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8')

const dataObj = JSON.parse(data) // pretvara JSON u JavaScript podatak (niz,objekat,...)

const server = http.createServer((req, res) => { // kreira server
    //  res.end('Hello from the server!') // salje response useru
    //  console.log(req.url)
    //  console.log(url.parse(req.url, true)) // parse - to parse variables from url. Mora da se prosledi true da bi se parsovao query u objekat
    const { query, pathname } = url.parse(req.url, true) // kreira variable query i pathname (moraju da se zovu isto kao u response)

    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' })

        const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('') // map - prihvata callback f-ju, ona prihvata trenutni elemenat i cuva ga u niz. tempCard - trenutni HTML, el - trenutni objekat, join - zato sto nam treba jedan string
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml)

        res.end(output)

        // Product page
    } else if (pathname === '/product') {
        res.writeHead(200, { 'Content-type': 'text/html' })
        const product = dataObj[query.id] // dataObj je niz, i vraca elemenat na poziciji koja dolazi sa query.id
        const output = replaceTemplate(tempProduct, product)
        res.end(output)

        // API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' })  // moramo da kazemo browseru da saljemo JSON
        res.end(data)  // res.end() mora da vrati string a ne objekat

        // Not found
    } else {
        res.writeHead(404, { // salje status code i header (code, {header}) uvek mora da se posalje pre response-a (res.end('<h1>Page not found!</h1>'))
            'Content-type': 'text/html',
            'my-own-header': 'hello-world' // mozemo da dodamo i svoje header-e
        })
        res.end('<h1>Page not found!</h1>')
    }
})

// listen to request 
server.listen(8000, '127.0.0.1', () => { // slusa request (port,lokalni ip, ()-opciono)
    console.log('Listening to requrests on port 8000')
})
