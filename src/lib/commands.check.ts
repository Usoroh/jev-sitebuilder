// node --experimental-strip-types src/lib/spoken-text.check.ts
import assert from "node:assert/strict";
import { applyCase, spokenText } from "./spoken-text.ts";

assert.equal(spokenText("change the text to Ship it tomorrow"), "Ship it tomorrow");
assert.equal(spokenText("change the headline to say Ship it tomorrow"), "Ship it tomorrow");
assert.equal(spokenText('make it read "Ship it tomorrow"'), "Ship it tomorrow");
// The first connective wins, so a later "to" stays in the new text.
assert.equal(spokenText("change text to Ship data to your app"), "Ship data to your app");
assert.equal(spokenText("change the text to Ship it tomorrow."), "Ship it tomorrow");
assert.equal(spokenText("I want a nav bar here"), null);
assert.equal(spokenText("change the text"), null);

// A case asked for at the end is an instruction, not part of the new words.
assert.equal(spokenText("change the text to ship it now in all caps"), "ship it now");
assert.equal(spokenText("change the text to ship it now, uppercase"), "ship it now");
assert.equal(spokenText("change the text to lower case letters"), "lower case letters", "only a trailing ask counts");

// Russian: the command is understood, the dictated words stay Russian.
assert.equal(spokenText("измени текст на Каждый инцидент"), "Каждый инцидент");
assert.equal(spokenText("поменяй заголовок на «Закрой инцидент»"), "Закрой инцидент");
assert.equal(spokenText("измени текст чтобы было Каждый инцидент"), "Каждый инцидент");
assert.equal(spokenText("напиши Книга демо"), "Книга демо");
assert.equal(spokenText("измени текст на отгрузи сегодня заглавными"), "отгрузи сегодня");
assert.equal(spokenText("добавь навбар сюда"), null, "not an edit, no new words");

// "make it" is only read as an edit when Jev says the intent is an edit, so a
// colour or a size command never reaches this.
assert.equal(spokenText("make it forty nine a month"), "forty nine a month");
assert.equal(spokenText("сделай Каждый инцидент"), "Каждый инцидент");

console.log("spoken-text: ok");

assert.equal(applyCase("ship it tomorrow", "spoken"), "ship it tomorrow");
assert.equal(applyCase("ship it tomorrow", "sentence"), "Ship it tomorrow");
assert.equal(applyCase("ship it tomorrow", "upper"), "SHIP IT TOMORROW");
assert.equal(applyCase("Ship It", "lower"), "ship it");
assert.equal(applyCase("book a call today", "title"), "Book a Call Today");
assert.equal(applyCase("SSO and SCIM", "sentence"), "SSO and SCIM", "sentence case must not flatten initials");
assert.equal(applyCase("", "sentence"), "");

console.log("case: ok");

import { reorder, steps } from "./shape.ts";

assert.equal(steps(2), 0, "the middle of the rubric means no change");
assert.equal(steps(4), 2);
assert.equal(steps(0.4), -2, "a fractional score rounds to a level");

assert.deepEqual(reorder([0, 1, 2, 3], 2, "earlier"), [0, 2, 1, 3]);
assert.deepEqual(reorder([0, 1, 2, 3], 2, "later"), [0, 1, 3, 2]);
assert.deepEqual(reorder([0, 1, 2, 3], 2, "first"), [2, 0, 1, 3]);
assert.deepEqual(reorder([0, 1, 2, 3], 0, "last"), [1, 2, 3, 0]);
assert.deepEqual(reorder([0, 1, 2, 3], 0, "earlier"), [0, 1, 2, 3], "already first");
assert.deepEqual(reorder([2, 0, 1], 0, "earlier"), [0, 2, 1], "moves within the order shown");
assert.deepEqual(reorder([0, 1], 9, "later"), [0, 1], "an item not in the list is left alone");

console.log("shape: ok");

import { insertBeside } from "./shape.ts";

assert.deepEqual(insertBeside([0, 1], 1, 2, "after"), [0, 1, 2]);
assert.deepEqual(insertBeside([0, 1], 1, 2, "before"), [0, 2, 1]);
assert.deepEqual(insertBeside([0, 1], 0, 2, "before"), [2, 0, 1]);
assert.deepEqual(insertBeside([2, 0, 1], 0, 3, "after"), [2, 0, 3, 1], "follows the order shown, not the indexes");
assert.deepEqual(insertBeside([0, 1], 9, 2, "after"), [0, 1, 2], "beside nothing: goes last");

console.log("insert: ok");

import { asPrice } from "./spoken-text.ts";

assert.equal(asPrice("10"), "$10");
assert.equal(asPrice("10 dollars"), "$10");
assert.equal(asPrice("$10"), "$10");
assert.equal(asPrice("9.99"), "$9.99");
assert.equal(asPrice("19 euros"), "€19");
assert.equal(asPrice("40 pounds a month"), "£40");
assert.equal(asPrice("ten dollars"), "$10");
assert.equal(asPrice("twenty four"), "$24");
assert.equal(asPrice("two hundred"), "$200");
assert.equal(asPrice("two thousand"), "$2000");
assert.equal(asPrice("free"), "free", "no amount: leave it alone");

console.log("price: ok");
