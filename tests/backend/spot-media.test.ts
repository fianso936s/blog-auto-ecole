import { test } from "node:test";
import assert from "node:assert/strict";
import { spotSchema } from "@repere/core";
const base = {
  id: "5f9407f4-8564-4b36-af80-c8d6a8fad59a",
  name: "Priorité masquée",
  category: "Priorité",
  lat: 48.9,
  lng: 2.3,
  note: "Observer à droite",
  status: "private",
};
const photo = {
  id: "247f6ba4-f082-43ba-8869-ef164a221c9d",
  dataUrl: "data:image/jpeg;base64,YQ==",
};
test("standalone points preserve photo data and explicit student audience", () => {
  const parsed = spotSchema.parse({
    ...base,
    photos: [photo],
    shareWithStudents: true,
  });
  assert.deepEqual(parsed.photos, [photo]);
  assert.equal(parsed.shareWithStudents, true);
  assert.equal(parsed.status, "private");
});
test("old clients omit media without implicitly deleting stored photos or audience", () => {
  const parsed = spotSchema.parse(base);
  assert.equal(parsed.photos, undefined);
  assert.equal(parsed.shareWithStudents, undefined);
});
test("standalone media rejects oversized collections and non-image content", () => {
  assert.equal(
    spotSchema.safeParse({ ...base, photos: Array(7).fill(photo) }).success,
    false,
  );
  assert.equal(
    spotSchema.safeParse({
      ...base,
      photos: [{ ...photo, dataUrl: "https://untrusted.example/photo" }],
    }).success,
    false,
  );
  assert.equal(
    spotSchema.safeParse({ ...base, shareWithStudents: "true" }).success,
    false,
  );
});
