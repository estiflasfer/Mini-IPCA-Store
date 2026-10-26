import React, { useState } from 'react';
import { Product, ScreenId } from '../../types';
import { formatCents, api } from '../../services/api';
import { ProductVisual } from '../common/ProductVisual';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Power,
  Search,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface T05ProductStockProps {
  products: Product[];
  onNavigate: (screen: ScreenId) => void;
  onRefreshProducts: () => void;
}

export const T05ProductStock: React.FC<T05ProductStockProps> = ({
  products,
  onNavigate,
  onRefreshProducts,
}) => {
  const { user, canManageCatalog, isStudent } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPriceDollars, setFormPriceDollars] = useState('');
  const [formVisualKey, setFormVisualKey] = useState('water');
  const [formActive, setFormActive] = useState(true);

  if (!canManageCatalog) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white border-2 border-rose-200 rounded-3xl shadow-lg text-center">
        <ShieldAlert className="w-16 h-16 mx-auto text-rose-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso no autorizado</h2>
        <p className="text-slate-600 mb-6">
          No tienes el permiso de gestión de catálogo activo. Contacta a tu docente.
        </p>
        <button
          type="button"
          onClick={() => onNavigate(isStudent ? 'S01' : 'T01')}
          className="min-h-[48px] px-6 py-2.5 rounded-xl bg-sky-600 text-white font-bold"
        >
          Volver a mi área
        </button>
      </div>
    );
  }

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const filteredProducts = products.filter((p) =>
    normalize(p.name).includes(normalize(searchTerm))
  );

  const handleOpenCreate = () => {
    setFormName('');
    setFormPriceDollars('1.00');
    setFormVisualKey('water');
    setFormActive(true);
    setIsCreating(true);
    setErrorMessage(null);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormPriceDollars((prod.priceCents / 100).toFixed(2));
    setFormVisualKey(prod.visualKey);
    setFormActive(prod.active);
    setErrorMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedPrice = parseFloat(formPriceDollars.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setErrorMessage('Por favor ingresa un precio válido en dólares (ej. 0.80).');
      return;
    }

    const priceCents = Math.round(parsedPrice * 100);

    setIsSubmitting(true);
    try {
      if (isCreating) {
        await api.createProduct({
          name: formName.trim(),
          priceCents,
          visualKey: formVisualKey,
          active: formActive,
        });
        setSuccessMessage(`Producto “${formName}” agregado correctamente.`);
      } else if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          name: formName.trim(),
          priceCents,
          visualKey: formVisualKey,
          active: formActive,
        });
        setSuccessMessage(`Producto “${formName}” actualizado correctamente.`);
      }
      setIsCreating(false);
      setEditingProduct(null);
      onRefreshProducts();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar producto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (prod: Product) => {
    try {
      await api.toggleProductActive(prod.id);
      onRefreshProducts();
      setSuccessMessage(
        `Producto “${prod.name}” ${!prod.active ? 'activado' : 'desactivado'} para la venta.`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Error al cambiar disponibilidad: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate(isStudent ? 'S01' : 'T01')}
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 mb-2 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver {isStudent ? 'al inicio de ventas' : 'al panel docente'}</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Productos y stock
          </h1>
          <p className="text-base text-slate-600">
            Agrega, edita o desactiva productos del catálogo.
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            * El stock indica disponibilidad para la venta (activo/inactivo). No se manejan cantidades numéricas de almacén.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="min-h-[50px] px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>Agregar producto</span>
        </button>
      </div>

      {successMessage && (
        <div
          role="status"
          className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center gap-3 font-semibold"
        >
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar producto en el catálogo..."
          className="w-full min-h-[44px] px-2 text-base text-slate-900 focus:outline-none"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="text-slate-400 hover:text-slate-600 font-bold px-2 cursor-pointer"
          >
            ×
          </button>
        )}
      </div>

      {/* Product Table / Cards */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Visual</th>
                <th className="py-4 px-6">Código y Producto</th>
                <th className="py-4 px-6">Precio unitario</th>
                <th className="py-4 px-6">Disponibilidad (Stock)</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    !p.active ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <ProductVisual visualKey={p.visualKey} name={p.name} size="md" />
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-lg text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{p.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-mono text-xl font-black text-sky-800">
                      {formatCents(p.priceCents)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {p.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        <span>Disponible (Activo)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-slate-400" />
                        <span>No disponible (Inactivo)</span>
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="min-h-[44px] px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Modificar precio o nombre"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`min-h-[44px] px-3 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                          p.active
                            ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={p.active ? 'Desactivar de la venta' : 'Reactivar en la tienda'}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{p.active ? 'Desactivar' : 'Activar'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Modal */}
      {(isCreating || editingProduct) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xl text-slate-900">
                {isCreating ? 'Agregar producto nuevo' : `Editar ${editingProduct?.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-xl cursor-pointer min-h-[44px] px-2"
              >
                ×
              </button>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl font-medium"
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Nombre del producto
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full min-h-[48px] px-4 rounded-xl border-2 border-slate-300 text-slate-900 font-medium focus:border-sky-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Precio en dólares (ej. 0.80 o 0.90)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="text"
                    value={formPriceDollars}
                    onChange={(e) => setFormPriceDollars(e.target.value)}
                    className="w-full min-h-[48px] pl-8 pr-4 rounded-xl border-2 border-slate-300 text-slate-900 font-mono text-lg font-bold focus:border-sky-600 focus:outline-none"
                    placeholder="0.80"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-1">
                  Ícono / Pictograma
                </label>
                <select
                  value={formVisualKey}
                  onChange={(e) => setFormVisualKey(e.target.value)}
                  className="w-full min-h-[48px] px-4 rounded-xl border-2 border-slate-300 text-slate-900 font-medium focus:border-sky-600 focus:outline-none cursor-pointer"
                >
                  <option value="water">Agua (Botella)</option>
                  <option value="juice">Jugo (Caja de jugo)</option>
                  <option value="cookies">Galletas</option>
                  <option value="yogurt">Yogur</option>
                  <option value="milk">Leche</option>
                  <option value="bread">Pan</option>
                  <option value="chocolate">Chocolate</option>
                  <option value="chips">Papas fritas</option>
                  <option value="candy">Caramelo</option>
                  <option value="tuna">Atún</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-slate-400 text-sky-600 cursor-pointer"
                  />
                  <span className="font-bold text-sm text-slate-800">
                    Producto disponible para la venta (Activo)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingProduct(null);
                  }}
                  className="min-h-[48px] px-5 rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[48px] px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer shadow-sm"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
