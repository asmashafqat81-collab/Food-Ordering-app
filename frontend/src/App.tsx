import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChefHat, Clock3, LogIn, MapPin, Search, ShoppingBag, Sparkles, UserRound, UtensilsCrossed, X } from "lucide-react";
import { api, setToken } from "./api";
import type { CartItem, Category, Order, Product, Restaurant, User } from "./types";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    Promise.all([api.restaurants(), api.me().catch(() => null)]).then(([rs, me]) => {
      setRestaurant(rs[0] || null); setUser(me);
      if (me) api.orders().then(setOrders).catch(() => {});
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    api.categories(restaurant._id).then(setCategories);
    api.products(`restaurant=${restaurant._id}`).then(setProducts);
  }, [restaurant]);

  const filtered = useMemo(() => products.filter(p => (!category || (typeof p.category === "string" ? p.category : p.category._id) === category) && (!search || p.name.toLowerCase().includes(search.toLowerCase()))), [products, category, search]);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);

  function add(p: Product) { setCart(c => { const found = c.find(i => i.product._id === p._id); return found ? c.map(i => i.product._id === p._id ? {...i, quantity:i.quantity+1} : i) : [...c, {product:p, quantity:1}]; }); setNotice(`${p.name} added to cart`); setTimeout(() => setNotice(""), 1800); }
  function change(id: string, delta: number) { setCart(c => c.map(i => i.product._id === id ? {...i, quantity:i.quantity+delta} : i).filter(i => i.quantity > 0)); }

  async function auth(mode: "login"|"register", v: any) {
    const me = mode === "login" ? await api.login(v.email, v.password) : await api.register(v.name, v.email, v.password);
    setUser(me); setAuthOpen(false); setNotice(`Welcome, ${me.name.split(" ")[0]}!`);
  }

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setCheckoutOpen(false); setAuthOpen(true); return; }
    await api.createOrder({ items: cart.map(i => ({ product: i.product._id, quantity: i.quantity })), deliveryAddress: address, phone });
    setCart([]); setCheckoutOpen(false); setOrdersOpen(true); setOrders(await api.orders()); setNotice("Order placed successfully!");
  }

  async function logout() { setToken(null); setUser(null); setOrders([]); }

  if (loading) return <div className="loading-screen"><ChefHat size={42}/><h2>Preparing your table…</h2></div>;

  return <div>
    <header className="nav">
      <div className="brand"><span className="brand-mark"><UtensilsCrossed size={18}/></span><span>Urban<span>Bites</span></span></div>
      <div className="nav-links"><button onClick={() => window.scrollTo({top:0,behavior:"smooth"})}>Menu</button>{user && <button onClick={() => setOrdersOpen(true)}>My orders</button>}</div>
      <div className="nav-actions">{user ? <button className="user-pill" onClick={logout}><UserRound size={16}/>{user.name.split(" ")[0]} · Sign out</button> : <button className="login-btn" onClick={() => setAuthOpen(true)}><LogIn size={17}/> Sign in</button>}<button className="cart-pill" onClick={() => setCartOpen(true)}><ShoppingBag size={18}/><span>{cartCount}</span></button></div>
    </header>

    <main>
      <section className="hero">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> Freshly made · delivered fast</div><h1>Good food.<br/><em>Good mood.</em></h1><p>Discover comforting classics and fresh favourites from Urban Bites, made to order and brought straight to your door.</p><div className="hero-actions"><button className="primary" onClick={() => document.getElementById("menu")?.scrollIntoView({behavior:"smooth"})}>Explore menu <ArrowRight size={17}/></button><span><Clock3 size={16}/> {restaurant?.etaMinutes || 30} min delivery</span></div></div>
        <div className="hero-image"><img src={restaurant?.image} alt={restaurant?.name}/><div className="hero-card"><div className="mini-icon"><ChefHat size={17}/></div><div><b>Today’s kitchen</b><span>{restaurant?.cuisine}</span></div><span className="open-dot">Open</span></div></div>
      </section>

      <section className="restaurant-strip"><div><MapPin size={17}/><span>Delivering from <b>{restaurant?.name}</b></span></div><span className="dot-sep">•</span><span>{restaurant?.description}</span></section>

      <section className="menu-section" id="menu">
        <div className="section-head"><div><span className="eyebrow">Our menu</span><h2>Made for your cravings</h2></div><div className="search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dishes…"/></div></div>
        <div className="chips"><button className={!category ? "active" : ""} onClick={() => setCategory("")}>All</button>{categories.map(c => <button className={category === c._id ? "active" : ""} key={c._id} onClick={() => setCategory(c._id)}>{c.name}</button>)}</div>
        {filtered.length ? <div className="product-grid">{filtered.map(p => <ProductCard key={p._id} product={p} onAdd={add}/>)}</div> : <div className="empty menu-empty"><UtensilsCrossed size={38}/><h3>No dishes found</h3><p>Try a different search or category.</p></div>}
      </section>

      <section className="perks"><div><ChefHat/><b>Cooked fresh</b><span>Made after you order</span></div><div><Clock3/><b>Fast delivery</b><span>Hot food, right on time</span></div><div><Sparkles/><b>Quality first</b><span>Ingredients we’re proud of</span></div></section>
    </main>

    <footer><div className="brand"><span className="brand-mark"><UtensilsCrossed size={16}/></span><span>Urban<span>Bites</span></span></div><span>© 2026 Food Ordering App · Built with React + Express + MongoDB</span></footer>

    {notice && <div className="toast">{notice}</div>}
    <CartDrawer items={cart} open={cartOpen} onClose={() => setCartOpen(false)} onChange={change} onCheckout={() => {setCartOpen(false); setCheckoutOpen(true)}}/>
    {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSubmit={auth}/>}
    {checkoutOpen && <div className="modal-backdrop"><div className="modal checkout"><button className="icon-btn modal-close" onClick={() => setCheckoutOpen(false)}><X/></button><h2>Checkout</h2><p>Where should we deliver your order?</p><form onSubmit={checkout}><label>Delivery address<input required value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, area, city"/></label><label>Phone number<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+92 300 1234567"/></label><div className="checkout-total"><span>Total</span><b>${(subtotal + (restaurant?.deliveryFee || 0)).toFixed(2)}</b></div><button className="primary wide">{user ? "Place order" : "Sign in to place order"}</button></form></div></div>}
    {ordersOpen && <div className="modal-backdrop"><div className="modal orders-modal"><button className="icon-btn modal-close" onClick={() => setOrdersOpen(false)}><X/></button><span className="eyebrow">Account</span><h2>Your orders</h2><div className="order-list">{orders.length ? orders.map(o => <div className="order-card" key={o._id}><div><b>{o.restaurant?.name}</b><span>{new Date(o.createdAt).toLocaleDateString()}</span></div><strong>${o.total.toFixed(2)}</strong><small className={`status ${o.status}`}>{o.status.replaceAll("_"," ")}</small></div>) : <div className="empty"><ShoppingBag size={35}/><h3>No orders yet</h3><p>Your completed orders will appear here.</p></div>}</div></div></div>}
  </div>;
}