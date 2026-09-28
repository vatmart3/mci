"use client";
import type { Product } from "@/lib/types";
import { ProductRow } from "./ProductRow";
import { PdfViewerProvider } from "./PdfViewer";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <PdfViewerProvider>
      <ul className="rounded-tile bg-white p-1.5 ring-1 ring-black/5 sm:p-2.5">
        {products.map((p, i) => (
          <ProductRow key={p.id} product={p} priority={i < 3} />
        ))}
      </ul>
    </PdfViewerProvider>
  );
}
