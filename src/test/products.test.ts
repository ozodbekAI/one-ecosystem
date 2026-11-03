import { describe, expect, it } from "vitest";
import { findProduct, PRODUCTS } from "@/lib/products";

describe("products list", () => {
  it("gives every product its own page address", () => {
    const slugs = PRODUCTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has an Uzbek tagline and description for every product", () => {
    for (const p of PRODUCTS) {
      expect(p.tagline.uz, p.slug).toBeTruthy();
      expect(p.description.uz, p.slug).toBeTruthy();
    }
  });

  it("lists live products before upcoming ones", () => {
    const firstSoon = PRODUCTS.findIndex((p) => p.status === "soon");
    const lastLive = PRODUCTS.map((p) => p.status).lastIndexOf("live");
    expect(firstSoon === -1 || lastLive < firstSoon).toBe(true);
  });

  it("finds a product by its page address", () => {
    expect(findProduct("plus")?.name).toBe("Plus");
    expect(findProduct("nope")).toBeUndefined();
  });
});
