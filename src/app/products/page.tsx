"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Product } from "@/types/api";
import { Plus, Pencil, Trash2, Package, RefreshCw, Search, Check } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ToastContainer, useToast } from "@/components/Toast";

const UNIT_OPTIONS = ["unidades", "kg", "g", "litros", "ml", "paquete", "lata", "bote"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("unidades");
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const { toasts, dismissToast, toast } = useToast();

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProducts(); }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName(""); setCategory(""); setUnit("unidades");
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setCategory(product.category || "");
    setUnit(product.unit);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSubmitting(true);
      const payload = { name: name.trim(), category: category.trim() || null, unit };
      if (editingProduct) {
        const updated = await api.updateProduct(editingProduct.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
      } else {
        const created = await api.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setShowModal(false);
      toast.success(editingProduct ? "Producto actualizado" : "Producto creado");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("No se pudo guardar el producto");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setProductToDelete(null);
      toast.success("Producto eliminado");
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("No se pudo eliminar el producto");
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = search.toLowerCase();
    return p.name.toLowerCase().includes(term) || (p.category?.toLowerCase() || "").includes(term);
  });

  const grouped = filteredProducts.reduce((acc, product) => {
    const key = product.category || "Sin categoria";
    if (!acc[key]) acc[key] = [];
    acc[key].push(product);
    return acc;
  }, {} as Record<string, Product[]>);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Productos</h1>
          <p className="text-xs text-slate-500 font-medium">{products.length} productos registrados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadProducts} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-sm">
            <Plus className="w-4 h-4" /><span>Nuevo</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o categoria..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400 font-medium">Cargando productos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-800">{search ? "Sin resultados" : "Sin productos aun"}</p>
          {!search && (
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all">
              <Plus className="w-4 h-4" />Crear primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([cat, catProducts]) => (
            <div key={cat} className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">{cat} ({catProducts.length})</h2>
              {catProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-sm">
                      {product.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-sm text-slate-900 block truncate">{product.name}</span>
                      <span className="text-xs text-slate-400 font-medium">Unidad: {product.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEditModal(product)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setProductToDelete({ id: product.id, name: product.name })} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" aria-label={`Eliminar ${product.name}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        titleId="product-modal-title"
        onClose={() => setShowModal(false)}
        variant="sheet"
        size="md"
      >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Nombre *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="ej: Leche, Arroz..." required autoFocus
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Categoria</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ej: Lacteos, Bebidas..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Unidad de medida</label>
                <div className="flex flex-wrap gap-2">
                  {UNIT_OPTIONS.map((u) => (
                    <button key={u} type="button" onClick={() => setUnit(u)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${unit === u ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"}`}>
                      {unit === u && <Check className="w-3 h-3" />}{u}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all">Cancelar</button>
                <button type="submit" disabled={submitting || !name.trim()} className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all">
                  {submitting ? "Guardando..." : editingProduct ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
      </Modal>

      <ConfirmModal
        isOpen={productToDelete !== null}
        title="Eliminar producto"
        message={`¿Eliminar "${productToDelete?.name ?? "este producto"}"?`}
        onCancel={() => setProductToDelete(null)}
        onConfirm={() => productToDelete && handleDelete(productToDelete.id)}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
