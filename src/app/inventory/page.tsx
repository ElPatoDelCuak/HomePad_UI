"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { InventoryItem, Product } from "@/types/api";
import { Plus, Minus, Trash2, ShoppingBag, AlertCircle, RefreshCw, Calendar, Search } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ToastContainer, useToast } from "@/components/Toast";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number>(1);
  const [expirationDate, setExpirationDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const { toasts, dismissToast, toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const [inventoryData, productsData] = await Promise.all([
        api.getInventory(),
        api.getProducts(),
      ]);
      setItems(inventoryData);
      setProducts(productsData);
    } catch (err) {
      console.error("Error loading inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateQty = async (item: InventoryItem, delta: number) => {
    const newQty = Math.max(0, Number((item.quantity + delta).toFixed(2)));
    if (newQty === 0) {
      setItemToDelete(item.id);
      return;
    }
    try {
      const updated = await api.updateInventoryItem(item.id, { quantity: newQty });
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await api.deleteInventoryItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setItemToDelete(null);
      toast.success("Artículo eliminado del inventario");
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("No se pudo eliminar el artículo");
    }
  };

  const handleSendToShoppingList = async (item: InventoryItem) => {
    try {
      await api.createShoppingItem({
        product_id: item.product_id,
        quantity: 1,
      });
      toast.success(`${item.product?.name || "Producto"} añadido a la lista de la compra`);
    } catch (err) {
      console.error("Error adding to shopping list:", err);
      toast.error("No se pudo añadir a la lista de la compra");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    try {
      setSubmitting(true);
      const newItem = await api.createInventoryItem({
        product_id: Number(selectedProductId),
        quantity: Number(quantity),
        expiration_date: expirationDate || null,
      });
      setItems((prev) => [newItem, ...prev]);
      setShowAddModal(false);
      setSelectedProductId("");
      setQuantity(1);
      setExpirationDate("");
      toast.success("Artículo añadido al inventario");
    } catch (err) {
      console.error("Error adding inventory item:", err);
      toast.error("No se pudo guardar en el inventario");
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

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Despensa</h1>
          <p className="text-xs text-slate-500 font-medium">Existencias actuales en casa</p>
        </div>
        <div className="flex gap-2">
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

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto o categoría..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      {/* Lista de inventario */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-400 font-medium">Cargando despensa...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-800">
              {search ? "Sin resultados" : "Tu despensa está vacía"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search
                ? "No se han encontrado productos coincidentes."
                : "Añade productos que tengas en casa para llevar el control."}
            </p>
          </div>
          {!search && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Añadir mi primer producto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const isExpiringSoon =
              item.expiration_date &&
              new Date(item.expiration_date).getTime() - new Date().getTime() <
                3 * 24 * 60 * 60 * 1000;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 truncate text-sm">
                      {item.product?.name || `Producto #${item.product_id}`}
                    </span>
                    {item.product?.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                        {item.product.category}
                      </span>
                    )}
                  </div>
                  {item.expiration_date && (
                    <div
                      className={`flex items-center gap-1 text-[11px] mt-1 font-medium ${
                        isExpiringSoon ? "text-amber-600" : "text-slate-400"
                      }`}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>Caduca: {item.expiration_date}</span>
                    </div>
                  )}
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                    <button
                      onClick={() => handleUpdateQty(item, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 active:scale-95 transition-all"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-xs text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-slate-600 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Acciones extra */}
                  <button
                    onClick={() => handleSendToShoppingList(item)}
                    title="Mandar a la lista de compra"
                    className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setItemToDelete(item.id)}
                    title="Eliminar"
                    aria-label={`Eliminar ${item.product?.name || "artículo"}`}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Añadir Artículo */}
      <Modal
        isOpen={showAddModal}
        title="Añadir a Despensa"
        titleId="inventory-modal-title"
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
                  Cantidad
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

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Fecha de Caducidad (Opcional)
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
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
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
      </Modal>

      <ConfirmModal
        isOpen={itemToDelete !== null}
        title="Eliminar artículo"
        message="¿Quieres eliminar este artículo del inventario?"
        onCancel={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete !== null && handleDeleteItem(itemToDelete)}
      />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
