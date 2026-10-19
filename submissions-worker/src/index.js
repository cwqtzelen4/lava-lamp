// Receives the Submissions form from the website and emails it, with the
// attached piece, to the magazine inbox. Runs on Cloudflare Workers.
import { EmailMessage } from "cloudflare:email";
import { createMimeMessage, Mailbox } from "mimetext";

const SITE = "https://lavalampmagazine.com";
const ALLOWED_ORIGINS = [
  "https://lavalampmagazine.com",
  "https://www.lavalampmagazine.com",
  "https://lava-lamp.pages.dev",
];
const FROM = "submissions@lavalampmagazine.com";
const TO = "lavalampmagazine@gmail.com";
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const OK_EXTENSIONS = [".doc", ".docx", ".pdf", ".rtf", ".txt", ".odt"];

// header values must stay on one line
const oneLine = (value, max = 200) => String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);

// base64 in lines of 76 characters, as email requires
function wrap76(text) {
  return text.replace(/.{76}/g, "function toBase64(buffer) {
");
}

function toBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Lava Lamp submissions", { status: 405, headers: { Allow: "POST" } });
    }

    const from = request.headers.get("Origin") || request.headers.get("Referer") || "";
    const origin = ALLOWED_ORIGINS.find((o) => from.startsWith(o)) || SITE;
    const back = (query) => Response.redirect(`${origin}/submissions/?${query}`, 303);

    try {
      const form = await request.formData();

      // hidden spam trap: real people never fill it in; bots get a fake "sent"
      if (form.get("_honey")) return back("sent=1");

      const name = oneLine(form.get("name"));
      const email = oneLine(form.get("email"));
      const title = oneLine(form.get("title"));
      const genre = oneLine(form.get("genre"));
      const note = String(form.get("note") || "").trim().slice(0, 5000);
      const file = form.get("attachment");

      if (!name || !email || !title || !email.includes("@")) return back("error=missing");
      if (!file || typeof file === "string" || !file.size) return back("error=missing");
      if (form.get("ethics_guide_read") !== "yes") return back("error=missing");

      const filename = oneLine(file.name, 120) || "submission";
      const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : "";
      if (!OK_EXTENSIONS.includes(extension)) return back("error=type");
      if (file.size > MAX_FILE_BYTES) return back("error=size");

      const body = [
        `Name: ${name}`,
        `AUBG email: ${email}`,
        `Title: ${title}`,
        `Genre: ${genre || "(not given)"}`,
        `Ethics guide read: yes`,
        "",
        "Anything else we should know:",
        note || "(nothing)",
      ].join("\n");

      const msg = createMimeMessage();
      msg.setSender({ name: "Lava Lamp website", addr: FROM });
      msg.setRecipient(TO);
      msg.setSubject(`New submission: ${title}`);
      msg.setHeader("Reply-To", new Mailbox({ name, addr: email }));
      // encoded as base64 so names and notes in Bulgarian or any other language arrive intact
      msg.addMessage({ contentType: "text/plain", encoding: "base64", data: wrap76(toBase64(new TextEncoder().encode(body))) });
      msg.addAttachment({
        filename,
        contentType: file.type || "application/octet-stream",
        data: wrap76(toBase64(await file.arrayBuffer())),
      });

      await env.SUBMISSIONS_MAIL.send(new EmailMessage(FROM, TO, msg.asRaw()));
      return back("sent=1");
    } catch (error) {
      console.error("submission failed", error && error.message);
      return back("error=1");
    }
  },
};
