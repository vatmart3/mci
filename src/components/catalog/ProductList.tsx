"use client";
import type { Product } from "@/lib/types";
import { ProductRow } from "./ProductRow";
import { PdfViewerProvider } from "./PdfViewer";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <PdfViewerProvider>
      <ul className="border-t border-ink">
        {products.map((p, i) => (
          <ProductRow key={p.id} product={p} priority={i < 3} />
        ))}
      </ul>
    </PdfViewerProvider>
  );
}
