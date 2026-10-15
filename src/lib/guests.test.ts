import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultGuestMessage, parseGuestList, renderGuestMessage } from "./guests";

test("ro'yxatdan raqamlash, belgilar va telefonlar olib tashlanadi", () => {
  const text = "1. Aziza opa\n2) G'ayrat aka +998 90 123-45-67\n\n- Karimovlar oilasi\n• Dilnoza\n   ";
  assert.deepEqual(parseGuestList(text).names, ["Aziza opa", "G'ayrat aka", "Karimovlar oilasi", "Dilnoza"]);
});

test("takroriy ismlar (katta-kichik harf, apostrof turlari) bir marta qo'shiladi", () => {
  const r = parseGuestList("G‘ayrat aka\ng'ayrat  aka\nAziza", ["AZIZA"]);
  assert.deepEqual(r.names, ["G‘ayrat aka"]);
  assert.deepEqual(r.duplicates, ["g'ayrat aka", "Aziza"]);
});

test("HTML teglar tozalanadi va uzunlik cheklanadi", () => {
  const r = parseGuestList(`<b>Ali</b>\n${"x".repeat(200)}`);
  assert.equal(r.names[0], "Ali");
  assert.equal(r.names[1].length, 80);
});

test("xabarga ism va havola qo'yiladi, {havola} bo'lmasa oxiriga qo'shiladi", () => {
  const g = { name: "Aziza opa", link: "https://t.uz/i/a?g=1" };
  assert.equal(renderGuestMessage("Salom, {ism}! {havola}", g), "Salom, Aziza opa! https://t.uz/i/a?g=1");
  assert.equal(renderGuestMessage("Salom, {ism}!", g), "Salom, Aziza opa!\n\nhttps://t.uz/i/a?g=1");
});

test("boshlang'ich xabar tadbir turiga mos", () => {
  const m = defaultGuestMessage("nikoh", "Bekzod", "Sevinch");
  assert.match(m, /Bekzod va Sevinchning nikoh to‘yiga/);
  assert.match(m, /\{ism\}/);
  assert.match(m, /\{havola\}/);
});
