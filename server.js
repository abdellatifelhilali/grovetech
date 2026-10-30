import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {analyze} from './scoring.js';
const port = Number(process.env.PORT || 3000);
async function body(req) {
 let data = ''; for await (const c of req) { data += c; if (data.length > 100000) throw new Error('Request too large'); } return JSON.parse(data);
}
async function remote(url, headers, options = {}) {
 const r = await fetch(url, {...options, headers, signal: AbortSignal.timeout(15000), redirect:'error'});
 if (!r.ok) throw new Error(`Provider returned HTTP ${r.status}`);
 return r.json();
}
http.createServer(async(req,res)=>{
 const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 try {
  if(req.url === '/api/health') return send(200,{ok:true});
  if(req.url === '/api/connections') return send(200,{shopify:!!(process.env.SHOPIFY_STORE && process.env.SHOPIFY_ACCESS_TOKEN),cj:!!process.env.CJ_ACCESS_TOKEN});
  if(req.url === '/api/analyze' && req.method === 'POST') {const p = await body(req); if(!Array.isArray(p) || !p.length || p.length>100) throw new Error('Provide 1–100 products'); return send(200,p.map(analyze).sort((a,b)=>b.score-a.score));}
  if(req.url === '/api/shopify/products' && req.method === 'GET') {
   const store=process.env.SHOPIFY_STORE;
   if(!store || !process.env.SHOPIFY_ACCESS_TOKEN) return send(409,{error:'Configure SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN on the server'});
   if(!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(store)) throw new Error('Use a valid *.myshopify.com store hostname');
   const data=await remote(`https://${store}/admin/api/2026-10/graphql.json`,{'X-Shopify-Access-Token':process.env.SHOPIFY_ACCESS_TOKEN, 'Content-Type':'application/json'}, {method:'POST',body:JSON.stringify({query:'{ products(first: 20) { nodes { id title status variants(first: 1) { nodes { price } } } } }'})});
   if(data.errors) return send(502,{error:'Shopify rejected the query. Check token permissions.'});
   return send(200,data);
  }
  if(req.url === '/api/cj/products' && req.method === 'GET') {
   if(!process.env.CJ_ACCESS_TOKEN) return send(409,{error:'Configure CJ_ACCESS_TOKEN on the server'});
   const data=await remote('https://developers.cjdropshipping.com/api2.0/v1/product/list?pageNum=1&pageSize=20',{'CJ-Access-Token':process.env.CJ_ACCESS_TOKEN});
   if(!data.result) return send(502,{error:'CJ rejected the request. Check token and account permissions.'});
   return send(200,data.data);
  }
  if(req.url === '/' && req.method === 'GET') {res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'",'X-Content-Type-Options':'nosniff'});return res.end(await readFile(new URL('./public/index.html',import.meta.url)));}
  if(req.url === '/app.js' && req.method === 'GET') {res.writeHead(200,{'Content-Type':'text/javascript'});return res.end(await readFile(new URL('./public/app.js',import.meta.url)));}
  send(404,{error:'Not found'});
 } catch(e){send(400,{error:e.message});}
}).listen(port,'127.0.0.1',()=>console.log(`GroveTech running on port ${port}`));
