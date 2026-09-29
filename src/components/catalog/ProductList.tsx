"use client";
import type { Product } from "@/lib/types";
import { ProductTable } from "./ProductRow";
import { PdfViewerProvider } from "./PdfViewer";

export function ProductList({ products }: { products: Product[] }) {
  return (
    <PdfViewerProvider>
      <ProductTable products={products} priorityCount={3} />
    </PdfViewerProvider>
  );
}
