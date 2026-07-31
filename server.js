import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { SYSTEM_PROMPT } from './backend/system-prompt.js';
import { searchCourseMaterial, tutorTools } from './backend/tools.js';

const root = path.dirname(fileURLToPath(import.meta.url));
await loadEnvFile();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-5-mini';
const answerSchema = {
  type: "object",
  properties: {
    nuocDi: {
      type: "string",
      enum: [
        "giang_lai",
        "goi_mo",
        "cho_vi_du",
        "chua_co_can_cu"
      ]
    },

    cauTraLoi: {
      type: "string",
      description: "Câu trả lời cuối cùng dành cho học viên."
    },

    soTrang: {
      anyOf: [
        {
          type: "integer"
        },
        {
          type: "null"
        }
      ]
    }
  },

  required: [
    "nuocDi",
    "cauTraLoi",
    "soTrang"
  ],

  additionalProperties: false
};
async function loadEnvFile() {
  try { const text = await readFile(path.join(root, '.env'), 'utf8'); text.split(/\r?\n/).forEach((line) => { const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, ''); }); } catch {}
}
function json(res, status, body) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)); }
function validPages(value) {
  if (!Array.isArray(value) || value.length > 40) return null;
  const pages = value.map((page) => ({ so: Number(page?.so), tieuDe: String(page?.tieuDe || '').slice(0, 300), noiDung: String(page?.noiDung || '').slice(0, 6000) }));
  return pages.every((page) => Number.isInteger(page.so) && page.so > 0 && page.tieuDe && page.noiDung) ? pages : null;
}
async function createResponse(input) {
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, instructions: SYSTEM_PROMPT, input, tools: tutorTools, text: { format: { type: 'json_schema', name: 'tutor_answer', strict: true, schema: answerSchema } } }) });
  if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}
async function answerQuestion(body) {
  const question = String(body.cauHoi || '').trim().slice(0, 2000);
  const selectedText = String(body.doanNguCanh || '').trim().slice(0, 4000);
  const pages = validPages(body.danhSachTrang);
  if (!question || !pages) throw new Error('Du lieu cau hoi hoac tai lieu khong hop le.');
  const toolTrace = [];
  let input = [{ role: 'user', content: [{ type: 'input_text', text: `Cau hoi: ${question}\nDoan hoc vien boi den: ${selectedText || '(khong co)'}` }] }];
  for (let turn = 0; turn < 3; turn += 1) {
    const response = await createResponse(input);
    const calls = (response.output || []).filter((item) => item.type === 'function_call');
    if (!calls.length) {
      try {
        return { ...JSON.parse(response.output_text), toolTrace };
      } catch {
        throw new Error('AI tra ve dinh dang khong hop le.');
      }
    }
    input.push(...response.output);
    for (const call of calls) {
      let args;
      let result;
      try {
        args = JSON.parse(call.arguments || '{}');
        result = call.name === 'search_course_material'
          ? searchCourseMaterial(args, pages)
          : { error: 'Tool khong duoc phep.' };
        toolTrace.push({
          turn: turn + 1,
          tool: call.name,
          arguments: args,
          status: result.error ? 'error' : 'success',
          resultCount: result.results?.length || 0
        });
      } catch {
        result = { error: 'Tham so tool khong hop le.' };
        toolTrace.push({ turn: turn + 1, tool: call.name, status: 'error', resultCount: 0 });
      }
      input.push({ type: 'function_call_output', call_id: call.call_id, output: JSON.stringify(result) });
    }
  }
  throw new Error('AI goi tool qua nhieu lan.');
}
async function serveIndex(res) {
  let html = await readFile(path.join(root, 'codebase', 'index.html'), 'utf8');
  const conflictAt = html.search(/\r?\n=======\r?\n/);
  if (conflictAt !== -1) html = `${html.slice(0, conflictAt)}\n</body>\n</html>`;
  html = html.replace(/^<<<<<<< HEAD\r?\n/m, '');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
}
const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) return serveIndex(res);
    if (req.method !== 'POST' || req.url !== '/api/tra-loi') return json(res, 404, { error: 'Not found' });
    if (!process.env.OPENAI_API_KEY) return json(res, 503, { error: 'Thieu OPENAI_API_KEY. Hay tao file .env tu .env.example.' });
    let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 100000) return json(res, 413, { error: 'Request qua lon.' }); }
    return json(res, 200, await answerQuestion(JSON.parse(raw)));
  } catch (error) { console.error(error.message); return json(res, 400, { error: error.message || 'Khong the xu ly cau hoi.' }); }
});
server.listen(port, () => console.log(`VLearn server: http://localhost:${port}`));
