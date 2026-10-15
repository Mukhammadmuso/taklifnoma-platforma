/**
 * O'zbek lotin ↔ kirill konvertori.
 *
 * Qoidalar: o‘/g‘ (har qanday apostrof varianti bilan), sh, ch, yo, yu, ya, ye,
 * so'z boshidagi e → э, tutuq belgisi → ъ, -tsiya → -ция, ng (н+г) va h.k.
 * Havolalar, email va @username'lar o'zgartirilmaydi.
 */

export type Script = "lat" | "cyr";

/** Lotin yozuvida ishlatiladigan barcha apostrof variantlari */
const APOS = "'‘’ʻʼ`´";
const APOS_RE = `[${APOS}]`;

/** Ko'rsatish uchun tipografik belgilar: o‘ g‘ (U+2018) va tutuq ’ (U+2019) */
const OKINA = "‘";
const TUTUQ = "’";

const VOWELS_LAT = "aeiouAEIOU";
const VOWELS_CYR = "аеёиоуэюяўАЕЁИОУЭЮЯЎ";

/** Translit qilinmaydigan bo'laklar: URL, email, @username, #heshteg, {o'rinbosar} */
const PROTECTED_RE = /(https?:\/\/\S+|www\.\S+|\S+@\S+\.\S+|@[A-Za-z0-9_]+|#[\p{L}0-9_]+|\{[A-Za-z_]+\})/gu;

function splitProtected(text: string, fn: (chunk: string) => string): string {
  let out = "";
  let last = 0;
  for (const m of text.matchAll(PROTECTED_RE)) {
    const i = m.index ?? 0;
    out += fn(text.slice(last, i)) + m[0];
    last = i + m[0].length;
  }
  return out + fn(text.slice(last));
}

function isUpper(s: string) {
  return s === s.toUpperCase() && s !== s.toLowerCase();
}

/** Asl harfning registriga moslash: "Sh" yoki "SH" */
function matchCase(src: string, out: string, nextChar?: string): string {
  if (!isUpper(src[0])) return out;
  // To'liq katta harfli so'z ichida (SHAHAR) — hammasi katta
  const wholeUpper = src.length > 1 ? isUpper(src) : nextChar !== undefined && isUpper(nextChar);
  if (wholeUpper) return out.toUpperCase();
  return out[0].toUpperCase() + out.slice(1);
}

/* ------------------------------------------------------------------ */
/* Lotin → Kirill                                                       */
/* ------------------------------------------------------------------ */

const LAT_SINGLE: Record<string, string> = {
  a: "а", b: "б", d: "д", e: "е", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж", k: "к",
  l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с", t: "т", u: "у",
  v: "в", x: "х", y: "й", z: "з", c: "ц", w: "в",
};

function latWordToCyr(word: string): string {
  let out = "";
  let i = 0;
  const lower = word.toLowerCase();
  while (i < word.length) {
    const ch = word[i];
    const lc = lower[i];
    const next = lower[i + 1] ?? "";
    const prevOut = out[out.length - 1] ?? "";
    const atStart = i === 0;

    // o‘ va g‘
    if ((lc === "o" || lc === "g") && next && APOS.includes(next)) {
      out += matchCase(ch, lc === "o" ? "ў" : "ғ", word[i + 2]);
      i += 2;
      continue;
    }
    // Ikki harfli birikmalar
    const pair = lc + next;
    if (pair === "sh" || pair === "ch") {
      out += matchCase(word.slice(i, i + 2), pair === "sh" ? "ш" : "ч", word[i + 2]);
      i += 2;
      continue;
    }
    // yo‘l: "y" + "o‘" (ё emas)
    if (pair === "yo" && APOS.includes(lower[i + 2] ?? "")) {
      out += matchCase(ch, "й", word[i + 1]);
      i += 1;
      continue;
    }
    if (pair === "yo" || pair === "yu" || pair === "ya") {
      const map = { yo: "ё", yu: "ю", ya: "я" } as const;
      out += matchCase(word.slice(i, i + 2), map[pair], word[i + 2]);
      i += 2;
      continue;
    }
    if (pair === "ye") {
      out += matchCase(word.slice(i, i + 2), "е", word[i + 2]);
      i += 2;
      continue;
    }
    // ts → ц: so'z boshida yoki -tsiya/-tsion qo'shimchalarida (aytsin, jo'natsa buzilmasin)
    if (pair === "ts" && (atStart || /^tsi(ya|on|o)/.test(lower.slice(i)))) {
      out += matchCase(word.slice(i, i + 2), "ц", word[i + 2]);
      i += 2;
      continue;
    }
    // Tutuq belgisi
    if (APOS.includes(ch)) {
      out += "ъ";
      i += 1;
      continue;
    }
    // e: so'z boshida va unlidan keyin → э
    if (lc === "e") {
      const afterVowel = VOWELS_CYR.includes(prevOut) && prevOut !== "";
      out += matchCase(ch, atStart || afterVowel ? "э" : "е", word[i + 1]);
      i += 1;
      continue;
    }
    const mapped = LAT_SINGLE[lc];
    out += mapped ? matchCase(ch, mapped, word[i + 1] ?? (i > 0 ? word[i - 1] : undefined)) : ch;
    i += 1;
  }
  return out;
}

export function latToCyr(text: string): string {
  if (!text) return text;
  return splitProtected(text, (chunk) =>
    chunk.replace(new RegExp(`[A-Za-z${APOS}]+`, "g"), (w) => {
      // So'z faqat apostroflardan iborat bo'lsa (tirnoq), tegmaymiz
      if (!/[A-Za-z]/.test(w)) return w;
      // Bosh/oxirdagi apostrof — tirnoq belgisi, tutuq emas
      const lead = w.match(new RegExp(`^${APOS_RE}+`))?.[0] ?? "";
      const tail = w.slice(lead.length).match(new RegExp(`(?<![oOgG])${APOS_RE}+$`))?.[0] ?? "";
      const core = w.slice(lead.length, w.length - tail.length);
      return lead + latWordToCyr(core) + tail;
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Kirill → Lotin                                                       */
/* ------------------------------------------------------------------ */

const CYR_SINGLE: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ж: "j", з: "z", и: "i", й: "y", к: "k",
  л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "x", ҳ: "h", қ: "q", ғ: "g" + OKINA, ў: "o" + OKINA, ш: "sh", ч: "ch", щ: "sh",
  ё: "yo", ю: "yu", я: "ya", э: "e", ы: "i", ъ: TUTUQ, ь: "",
};

function cyrWordToLat(word: string): string {
  let out = "";
  const lower = word.toLowerCase();
  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    const lc = lower[i];
    const prev = lower[i - 1] ?? "";
    let mapped: string | undefined;
    if (lc === "е") {
      // so'z boshida, unli yoki ъ/ь dan keyin → ye
      mapped = i === 0 || VOWELS_CYR.includes(prev) || prev === "ъ" || prev === "ь" ? "ye" : "e";
    } else if (lc === "ц") {
      mapped = i === 0 ? "s" : "ts";
    } else {
      mapped = CYR_SINGLE[lc];
    }
    if (mapped === undefined) {
      out += ch;
      continue;
    }
    if (mapped === "" ) continue;
    out += isUpper(ch) ? matchCase(word.length > 1 ? word : ch, mapped, word[i + 1]) : mapped;
  }
  return out;
}

export function cyrToLat(text: string): string {
  if (!text) return text;
  return splitProtected(text, (chunk) =>
    chunk.replace(/[Ѐ-ӿ]+/g, (w) => {
      // Katta harfli so'z ichida har harf alohida tekshiriladi
      if (w.length > 1 && isUpper(w)) return cyrWordToLat(w).toUpperCase();
      return cyrWordToLat(w);
    }),
  );
}

/* ------------------------------------------------------------------ */
/* Umumiy                                                               */
/* ------------------------------------------------------------------ */

/** Matn qaysi yozuvda ekanini taxmin qiladi */
export function detectScript(text: string): Script {
  const cyr = (text.match(/[Ѐ-ӿ]/g) ?? []).length;
  const lat = (text.match(/[A-Za-z]/g) ?? []).length;
  return cyr > lat ? "cyr" : "lat";
}

/** Lotin matnni tipografik ko'rinishga keltiradi: o' → o‘, tutuq → ’ */
export function typoLat(text: string): string {
  if (!text) return text;
  return splitProtected(text, (chunk) =>
    chunk
      .replace(new RegExp(`([oOgG])${APOS_RE}`, "g"), `$1${OKINA}`)
      .replace(new RegExp(`(\\p{L})${APOS_RE}(?=\\p{L})`, "gu"), (m, a: string) =>
        m.endsWith(OKINA) ? m : `${a}${TUTUQ}`,
      ),
  );
}

/** Matnni kerakli yozuvga o'giradi (allaqachon shu yozuvda bo'lsa — faqat tipografiya) */
export function toScript(text: string | null | undefined, target: Script): string {
  if (!text) return "";
  if (target === "cyr") return detectScript(text) === "cyr" ? text : latToCyr(text);
  return typoLat(detectScript(text) === "lat" ? text : cyrToLat(text));
}
