import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { CartItem } from "../types";

export default function CartDrawer({ items, open, onClose, onChange, onCheckout }: {
  items: CartItem[]; open: boolean; onClose: () => void; onChange: (id: string, delta: number) => void; onCheckout: () => void;
}) {
  if (!open) return null;
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return <div className="drawer-backdrop" onClick={onClose}>
    <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
      <div className="drawer-head"><div><ShoppingBag size={19}/><h2>Your cart</h2></div><button className="icon-btn" onClick={onClose}><X/></button></div>
      {items.length === 0 ? <div className="empty"><ShoppingBag size={42}/><h3>Your cart is empty</h3><p>Add something delicious to get started.</p></div> :
      <>
        <div className="cart-list">{items.map(i => <div className="cart-row" key={i.product._id}>
          <img src={i.product.image} alt="" />
          <div className="cart-info"><strong>{i.product.name}</strong><span>${(i.product.price * i.quantity).toFixed(2)}</span>
            <div className="qty"><button onClick={() => onChange(i.product._id, -1)}><Minus size={14}/></button><b>{i.quantity}</b><button onClick={() => onChange(i.product._id, 1)}><Plus size={14}/></button><button className="trash" onClick={() => onChange(i.product._id, -i.quantity)}><Trash2 size={14}/></button></div>
          </div>
        </div>)}</div>
        <div className="drawer-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
        <button className="primary wide" onClick={onCheckout}>Checkout · ${subtotal.toFixed(2)}</button>
      </>}
    </aside>
  </div>;
}