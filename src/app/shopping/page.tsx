"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ShoppingItem, Product } from "@/types/api";
import { Plus, Check, Trash2, ShoppingCart, RefreshCw, Archive, Search } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ToastContainer, useToast } from "@/components/Toast";
import { ApiErrorState } from "@/components/ApiErrorState";

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  // Modal form states
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [clearPickedOpen, setClearPickedOpen] = useState(false);
  const { toasts, dismissToast, toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [shoppingData, productsData] = await Promise.all([
        api.getShoppingList(),
        api.getProducts(),
      ]);
      setItems(shoppingData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading shopping list:", err);
      setError(err instanceof Error ? err.message : "No se pudo cargar la lista de la compra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleTogglePicked = async (item: ShoppingItem) => {
    try {
      const updated = await api.updateShoppingItem(item.id, {
        is_picked: !item.is_picked,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error("Error toggling item:", err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteShoppingItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      console.error("Error deleting shopping item:", err);
    }
  };

  const handleClearPicked = async () => {
    const pickedItems = items.filter((i) => i.is_picked);
    if (pickedItems.length === 0) return;

    try {
      const ids = pickedItems.map((i) => i.id);
      await api.deleteShoppingItems(ids);
      setItems((prev) => prev.filter((i) => !i.is_picked));
      setClearPickedOpen(false);
      toast.success("Artículos comprados eliminados");
    } catch (err) {
      console.error("Error clearing picked items:", err);
      toast.error("No se pudieron eliminar los artículos comprados");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      setSubmitting(true);
      const newItem = await api.createShoppingItem({
        product_id: Number(selectedProductId),
        quantity: Number(quantity),
        is_picked: false,
      });
      setItems((prev) => [newItem, ...prev]);
      setShowAddModal(false);
      setSelectedProductId("");
      setQuantity(1);
      toast.success("Artículo añadido a la lista");
    } catch (err) {
      console.error("Error adding shopping item:", err);
      toast.error("No se pudo añadir el artículo a la lista");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const name = item.product?.name?.toLowerCase() || "";
    const cat = item.product?.category?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || cat.includes(term);
  });

  const pendingItems = filteredItems.filter((i) => !i.is_picked);
  const pickedItems = filteredItems.filter((i) => i.is_picked);

  return (
    <div className="space-y-4 p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Lista de la Compra</h1>
          <p className="text-xs text-slate-500 font-medium">
            {pendingItems.length} pendientes • {pickedItems.length} en el carrito
          </p>
        </div>
        <div className="flex gap-2">
          {pickedItems.length > 0 && (
            <button
              onClick={() => setClearPickedOpen(true)}
              title="Limpiar artículos comprados"
              className="p-2 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir</span>
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar artículo para comprar..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* Listas */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400 font-medium">Cargando lista...</p>
        </div>
      ) : error ? (
        <ApiErrorState message={error} onRetry={loadData} />
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              {search ? "Sin resultados" : "Tu lista de la compra está vacía"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "No se han encontrado productos coincidentes."
                : "Añade lo que falte en casa antes de ir al supermercado."}
            </p>
          </div>
          {!search && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Añadir artículo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
          {/* Pendientes */}
          <div className="space-y-2">
            {pendingItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTogglePicked(item)}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-6 h-6 rounded-lg border-2 border-slate-300 group-hover:border-emerald-500 flex items-center justify-center transition-colors shrink-0">
                    {item.is_picked && <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-sm text-slate-900 block truncate">
                      {item.product?.name || `Producto #${item.product_id}`}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.quantity} {item.product?.unit || "uds."}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Ya en el carrito */}
          {pickedItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200/80">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
                En el carrito ({pickedItems.length})
              </span>
              {pickedItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleTogglePicked(item)}
                  className="bg-slate-50/60 rounded-2xl border border-slate-200/40 p-3 flex items-center justify-between gap-3 cursor-pointer group opacity-60 select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    </div>
                    <div className="truncate line-through text-slate-500">
                      <span className="font-semibold text-sm block truncate">
                        {item.product?.name || `Producto #${item.product_id}`}
                      </span>
                      <span className="text-xs">
                        {item.quantity} {item.product?.unit || "uds."}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Añadir a la lista */}
      <Modal
        isOpen={showAddModal}
        title="Añadir a la Compra"
        titleId="shopping-modal-title"
        onClose={() => setShowAddModal(false)}
      >
            <form onSubmit={handleAddItem} className="space-y-3">

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Producto
                </label>
                {products.length === 0 ? (
                  <p className="text-xs text-amber-600">
                    Primero debes crear productos en la pestaña &quot;Productos&quot;.
                  </p>
                ) : (
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Selecciona un producto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Cantidad a comprar
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedProductId}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {submitting ? "Añadiendo..." : "Añadir"}
                </button>
              </div>
            </form>
      </Modal>
      <ConfirmModal
        isOpen={clearPickedOpen}
        title="Limpiar lista comprada"
        message={`¿Eliminar los ${items.filter((item) => item.is_picked).length} artículos ya comprados?`}
        onCancel={() => setClearPickedOpen(false)}
        onConfirm={handleClearPicked}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
