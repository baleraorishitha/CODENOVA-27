// Minimal zero-dependency API and static server. Run: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const dbFile = path.join(root, 'listings.json');

const seed = [
  {id:1,title:'Fujifilm Instax Mini 11',price:'3,200',category:'Electronics',condition:'Like new',icon:'📷',color:'purple',seller:'Riya, Design'},
  {id:2,title:'Engineering Mathematics',price:'280',category:'Books',condition:'Good',icon:'📘',color:'blue',seller:'Aman, ECE'},
  {id:3,title:'Study lamp, soft white',price:'450',category:'Furniture',condition:'Like new',icon:'💡',color:'yellow',seller:'Nisha, Hostel B'},
  {id:4,title:'Hercules Roadeo cycle',price:'4,500',category:'Cycles',condition:'Good',icon:'🚲',color:'green',seller:'Ishaan, MBA'},
  {id:5,title:'Organic chemistry notes',price:'120',category:'Notes',condition:'Good',icon:'📝',color:'pink',seller:'Kavya, Chem'},
  {id:6,title:'Sony wired headphones',price:'650',category:'Electronics',condition:'Used',icon:'🎧',color:'orange',seller:'Dev, CSE'},
  {id:7,title:'Wooden bedside table',price:'900',category:'Furniture',condition:'Good',icon:'🪑',color:'yellow',seller:'Meera, Hostel C'},
  {id:8,title:'Atomic Habits',price:'180',category:'Books',condition:'Like new',icon:'📕',color:'blue',seller:'Zoya, Law'}
];
const read = () => fs.existsSync(dbFile) ? JSON.parse(fs.readFileSync(dbFile, 'utf8')) : seed;
const write = data => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
const send = (res, code, body, type='application/json') => {res.writeHead(code, {'Content-Type':type});res.end(type==='application/json'?JSON.stringify(body):body)};
const mime = file => ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[path.extname(file)] || 'application/octet-stream';

http.createServer((req,res)=>{
  const url = new URL(req.url, `http://${req.headers.host}`);
  if(url.pathname === '/api/listings' && req.method === 'GET') return send(res,200,read());
  if(url.pathname === '/api/listings' && req.method === 'POST'){
    let raw='';req.on('data',chunk=>raw+=chunk);req.on('end',()=>{try{const item=JSON.parse(raw);if(!item.title || item.price===undefined) return send(res,400,{error:'title and price are required'});const data=read();item.id=Date.now();data.unshift(item);write(data);send(res,201,item)}catch{send(res,400,{error:'Invalid JSON'})}});return;
  }
  const match=url.pathname.match(/^\/api\/listings\/(\d+)$/);
  if(match && req.method === 'DELETE'){const data=read().filter(x=>x.id !== Number(match[1]));write(data);return send(res,204,'','text/plain')}
  const file=path.normalize(path.join(root, url.pathname === '/' ? 'index.html' : url.pathname));
  if(!file.startsWith(root) || !fs.existsSync(file)) return send(res,404,'Not found','text/plain');
  send(res,200,fs.readFileSync(file),mime(file));
}).listen(3000,()=>console.log('Loop marketplace: http://localhost:3000'));
