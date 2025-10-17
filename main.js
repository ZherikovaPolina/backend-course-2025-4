const { program } = require('commander');
const fs = require('fs');
const http = require('http');
const url = require('url');
const parser = require('fast-xml-parser');

program
  .requiredOption('-i, --input <file>', 'Path to the file to read')
  .requiredOption('-h, --host <host>', 'Server address')
  .requiredOption('-p, --port <port>', 'Server port');

program.parse();

const options = program.opts();

if (!fs.existsSync(options.input)) {
  console.error("Can't find input file");
  process.exit(1);
}

const server = http.createServer((request, response) => {
  const query = url.parse(request.url, true).query;

  fs.readFile(options.input, 'utf8', (err, textData) => {
    if (err) {
      response.writeHead(500, 'Error', { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end("Can't read input file");
      return;
    }

    let data;
    try {
      data = JSON.parse(textData);
    } catch {
      response.writeHead(500, 'Error', { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Error JSON');
      return;
    }

    if (query.furnished === 'true') {
      data = data.filter(h => h.furnishingstatus === 'furnished');
    }

    if (query.max_price) {
      const maxPrice = Number(query.max_price);
      if (!isNaN(maxPrice)) {  
        data = data.filter(h => Number(h.price) < maxPrice);
      }
    }

    const builder = new parser.XMLBuilder({ ignoreAttributes: false, format: true });
    const xmlData = builder.build({ houses: { house: data } });

    response.writeHead(200, 'OK', { 'Content-Type': 'application/xml; charset=utf-8' });
    response.end(xmlData);
  });
});

server.listen(options.port, options.host, () => {
  console.log(`Server running: http://${options.host}:${options.port}`);
});


