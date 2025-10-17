const { program } = require('commander');
const fs = require('fs');
const http = require('http');

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

try {
  const data = fs.readFileSync(options.input, 'utf8');
  console.log('File read successfully', options.input);
} catch (err) {
  console.error("Can't read input file");
  process.exit(1);
}

const server = http.createServer((request, response) => {
  response.writeHead(200, 'OK', { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Server is running!\n');
});

server.listen(options.port, options.host, () => {
  console.log(`Server running: http://${options.host}:${options.port}`);
});

