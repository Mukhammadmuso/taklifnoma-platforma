import { test } from "node:test";
import assert from "node:assert/strict";
import { cyrToLat, latToCyr, toScript, typoLat } from "./translit";

const pairs: [string, string][] = [
  ["O'zbekiston", "Ўзбекистон"],
  ["To'y kuni keldi!", "Тўй куни келди!"],
  ["Tug'ilgan kun", "Туғилган кун"],
  ["Shahar", "Шаҳар"],
  ["SHAHAR", "ШАҲАР"],
  ["choyxona", "чойхона"],
  ["yubiley", "юбилей"],
  ["Yer", "Ер"],
  ["ertak", "эртак"],
  ["poeziya", "поэзия"],
  ["ma'no", "маъно"],
  ["Qur'on", "Қуръон"],
  ["konstitutsiya", "конституция"],
  ["aytsin", "айтсин"],
  ["yanvar", "январ"],
  ["iyun", "июн"],
  ["Yusupovlar", "Юсуповлар"],
  ["Hurmatli mehmonimiz", "Ҳурматли меҳмонимиз"],
  ["yo'l", "йўл"],
  ["Bog‘ishamol to‘yxonasi", "Боғишамол тўйхонаси"],
  ["Ming", "Минг"],
];

test("lotin → kirill", () => {
  for (const [lat, cyr] of pairs) assert.equal(latToCyr(lat), cyr, lat);
});

test("kirill → lotin", () => {
  assert.equal(cyrToLat("Ўзбекистон"), "O‘zbekiston");
  assert.equal(cyrToLat("Тўй куни келди!"), "To‘y kuni keldi!");
  assert.equal(cyrToLat("Шаҳар"), "Shahar");
  assert.equal(cyrToLat("ШАҲАР"), "SHAHAR");
  assert.equal(cyrToLat("маъно"), "ma’no");
  assert.equal(cyrToLat("Ер"), "Yer");
  assert.equal(cyrToLat("поэзия"), "poeziya");
  assert.equal(cyrToLat("юбилей"), "yubiley");
  assert.equal(cyrToLat("Нодира Каримова"), "Nodira Karimova");
  assert.equal(cyrToLat("цирк"), "sirk");
  assert.equal(cyrToLat("Ёқубов"), "Yoqubov");
});

test("havola va username o'zgarmaydi", () => {
  assert.equal(latToCyr("Telegram: @bekzod_y https://t.me/x"), "Телеграм: @bekzod_y https://t.me/x");
});

test("tipografiya", () => {
  assert.equal(typoLat("to'y o`g'il ma'no"), "to‘y o‘g‘il ma’no");
  assert.equal(toScript("Тўй", "lat"), "To‘y");
  assert.equal(toScript("To'y", "cyr"), "Тўй");
});
