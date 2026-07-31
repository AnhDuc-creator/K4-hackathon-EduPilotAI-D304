import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { SYSTEM_PROMPT } from "./backend/system-prompt.js";
import { searchCourseMaterial, tutorTools } from "./backend/tools.js";

const root = path.dirname(fileURLToPath(import.meta.url));
await loadEnvFile();

const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || "openai/gpt-4o-mini";
// OpenRouter: https://openrouter.ai/api/v1 | OpenAI: https://api.openai.com/v1
const baseUrl = (
  process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1"
).replace(/\/+$/, "");

const NUOC_DI_HOP_LE = ["giang_lai", "goi_mo", "cho_vi_du", "chua_co_can_cu"];

const answerSchema = {
  type: "object",
  properties: {
    nuocDi: { type: "string", enum: NUOC_DI_HOP_LE },
    cauTraLoi: {
      type: "string",
      description: "Cau tra loi cuoi cung danh cho hoc vien.",
    },
    soTrang: { anyOf: [{ type: "integer" }, { type: "null" }] },
  },
  required: ["nuocDi", "cauTraLoi", "soTrang"],
  additionalProperties: false,
};

/* ---------------------------------------------------------------------------
   Tien ich
--------------------------------------------------------------------------- */
async function loadEnvFile() {
  try {
    const text = await readFile(path.join(root, ".env"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    /* khong co .env thi bo qua */
  }
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function validPages(value) {
  if (!Array.isArray(value) || value.length > 40) return null;
  const pages = value.map((page) => ({
    so: Number(page?.so),
    tieuDe: String(page?.tieuDe || "").slice(0, 300),
    noiDung: String(page?.noiDung || "").slice(0, 6000),
  }));
  const hopLe = pages.every(
    (page) =>
      Number.isInteger(page.so) && page.so > 0 && page.tieuDe && page.noiDung,
  );
  return hopLe ? pages : null;
}

/* ---------------------------------------------------------------------------
   Chot bang code, khong giao cho AI tu giu loi hua.
   AI chi duoc dan so trang ma tool that su tra ve.
--------------------------------------------------------------------------- */
export function chuanHoaKetQua(raw, trangTuTool) {
  const chophep = new Set(trangTuTool);
  let nuocDi = NUOC_DI_HOP_LE.includes(raw?.nuocDi)
    ? raw.nuocDi
    : "chua_co_can_cu";
  let cauTraLoi = String(raw?.cauTraLoi || "").trim();
  let soTrang = Number.isInteger(raw?.soTrang) ? raw.soTrang : null;
  const canhBao = [];

  if (!cauTraLoi) {
    nuocDi = "chua_co_can_cu";
    cauTraLoi =
      "Minh chua tra loi duoc cau nay. Ban thu hoi lai hoac hoi giang vien va TA.";
    canhBao.push("cauTraLoi rong");
  }

  if (nuocDi === "chua_co_can_cu") {
    if (soTrang !== null)
      canhBao.push("chua_co_can_cu nhung co soTrang, da bo");
    soTrang = null;
  } else if (soTrang !== null && !chophep.has(soTrang)) {
    // AI dan mot trang khong co trong ket qua tool: day la bia so trang.
    canhBao.push(`soTrang ${soTrang} khong co trong ket qua tool`);
    soTrang = trangTuTool[0] ?? null;
  } else if (soTrang === null && trangTuTool.length) {
    soTrang = trangTuTool[0];
    canhBao.push("AI khong dan trang, lay trang khop nhat tu tool");
  }

  if (nuocDi !== "chua_co_can_cu" && soTrang === null) {
    // Co cau tra loi nhung khong co bat ky can cu nao: khong cho di qua.
    nuocDi = "chua_co_can_cu";
    cauTraLoi =
      "Minh chua tim duoc can cu cho cau hoi nay trong tai lieu dang mo, nen minh khong tra loi de tranh noi sai.\n\n" +
      "Ban thu hoi lai bang tu ngu co trong tai lieu, mo dung tai lieu chua noi dung do, hoac hoi giang vien va TA.";
    canhBao.push("khong co can cu, da ha ve chua_co_can_cu");
  }

  return { nuocDi, cauTraLoi, soTrang, canhBao };
}

/* ---------------------------------------------------------------------------
   Goi model qua chuan Chat Completions (chay duoc voi OpenRouter va OpenAI)
--------------------------------------------------------------------------- */
async function goiModel(messages) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      tools: tutorTools,
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tutor_answer",
          strict: true,
          schema: answerSchema,
        },
      },
    }),
  });
  if (!res.ok) {
    const text = (await res.text()).slice(0, 300);
    throw new Error(`API ${res.status}: ${text}`);
  }
  const data = await res.json();
  if (data.error)
    throw new Error(`API: ${data.error.message || "loi khong ro"}`);
  return data;
}

// Model doi khi boc JSON trong ```json hoac them loi dan. Go ra truoc khi parse.
function parseJson(text) {
  const sach = String(text || "")
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(sach);
  } catch {
    const dau = sach.indexOf("{");
    const cuoi = sach.lastIndexOf("}");
    if (dau !== -1 && cuoi > dau) {
      try {
        return JSON.parse(sach.slice(dau, cuoi + 1));
      } catch {
        /* roi xuong duoi */
      }
    }
    return null;
  }
}

async function answerQuestion(body) {
  const question = String(body.cauHoi || "")
    .trim()
    .slice(0, 2000);
  const selectedText = String(body.doanNguCanh || "")
    .trim()
    .slice(0, 4000);
  const pages = validPages(body.danhSachTrang);
  if (!question || !pages)
    throw new Error("Du lieu cau hoi hoac tai lieu khong hop le.");

  const toolTrace = [];
  const trangTuTool = [];
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Cau hoi: ${question}\nDoan hoc vien boi den: ${selectedText || "(khong co)"}`,
    },
  ];

  for (let turn = 0; turn < 3; turn += 1) {
    const data = await goiModel(messages);
    const message = data.choices?.[0]?.message;
    if (!message) throw new Error("API khong tra ve noi dung.");

    const calls = message.tool_calls || [];
    if (!calls.length) {
      const raw = parseJson(message.content);
      if (!raw) throw new Error("AI tra ve dinh dang khong hop le.");
      return { ...chuanHoaKetQua(raw, trangTuTool), toolTrace };
    }

    messages.push(message);

    for (const call of calls) {
      let ketQua;
      let args;
      try {
        args = JSON.parse(call.function?.arguments || "{}");
        ketQua =
          call.function?.name === "search_course_material"
            ? searchCourseMaterial(args, pages)
            : { error: "Tool khong duoc phep." };
        for (const item of ketQua.results || []) trangTuTool.push(item.page);
        toolTrace.push({
          turn: turn + 1,
          tool: call.function?.name,
          arguments: args,
          status: ketQua.error ? "error" : "success",
          resultCount: ketQua.results?.length || 0,
        });
      } catch {
        ketQua = { error: "Tham so tool khong hop le." };
        toolTrace.push({
          turn: turn + 1,
          tool: call.function?.name,
          status: "error",
          resultCount: 0,
        });
      }
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(ketQua),
      });
    }
  }
  throw new Error("AI goi tool qua nhieu lan.");
}

/* ---------------------------------------------------------------------------
   HTTP
--------------------------------------------------------------------------- */
const KIEU_FILE = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

async function serveStatic(res, ten) {
  try {
    const duongDan = path.join(root, "codebase", ten);
    if (!duongDan.startsWith(path.join(root, "codebase")))
      return json(res, 404, { error: "Not found" });
    const noiDung = await readFile(duongDan);
    res.writeHead(200, {
      "Content-Type":
        KIEU_FILE[path.extname(ten)] || "text/plain; charset=utf-8",
    });
    res.end(noiDung);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET") {
      if (req.url === "/" || req.url === "/index.html")
        return serveStatic(res, "index.html");
      if (/^\/[\w.-]+\.(js|css)$/.test(req.url))
        return serveStatic(res, req.url.slice(1));
    }
    if (req.method !== "POST" || req.url !== "/api/tra-loi") {
      return json(res, 404, { error: "Not found" });
    }
    if (!process.env.OPENAI_API_KEY) {
      return json(res, 503, {
        error: "Thieu OPENAI_API_KEY. Hay tao file .env tu .env.example.",
      });
    }

    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 100000)
        return json(res, 413, { error: "Request qua lon." });
    }
    return json(res, 200, await answerQuestion(JSON.parse(raw)));
  } catch (error) {
    console.error(error.message);
    return json(res, 400, {
      error: error.message || "Khong the xu ly cau hoi.",
    });
  }
});

if (process.env.NODE_ENV !== "test") {
  server.listen(port, () =>
    console.log(`VLearn server: http://localhost:${port}`),
  );
}
