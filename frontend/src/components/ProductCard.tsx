import { Plus, Star } from "lucide-react";
import type { Product } from "../types";

export default function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.name} className="product-image" />
        {product.isFeatured && <span className="featured"><Star size={12} fill="currentColor" /> Popular</span>}
      </div>
      <div className="product-body">
        <div className="product-meta"><span>{typeof product.category === "string" ? "" : product.category.name}</span><span>${product.price.toFixed(2)}</span></div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <button className="add-btn" onClick={() => onAdd(product)} disabled={!product.isAvailable}><Plus size={17} /> Add to cart</button>
      </div>
    </article>
  );
}