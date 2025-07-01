'use client';

import React, { useState } from 'react';
import { useGroceryStores } from '@/hooks/useGroceryStores';
import { GroceryMonth, GroceryStore, GroceryItem } from '@/lib/grocery-types';
import GroceryItemEditor from './GroceryItemEditor';

interface GroceryManagerProps {
  onBack: () => void;
}

export default function GroceryManager({ onBack }: GroceryManagerProps) {
  const {
    stores,
    months,
    currentMonth,
    monthSummary,
    loading,
    error,
    createStore,
    createMonth,
    addItem,
    updateItem,
    deleteItem,
    deleteStore,
    deleteMonth,
    togglePurchased,
    generatePDFReport,
    loadMonthSummary,
    setError
  } = useGroceryStores();

  const [showCreateMonth, setShowCreateMonth] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [newMonthName, setNewMonthName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    quantity: 1, 
    price: 0, 
    notes: '', 
    priority: 2 
  });
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'priority' | 'price'>('priority');
  const [viewMode, setViewMode] = useState<'cards' | 'detail'>('cards');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [monthToDelete, setMonthToDelete] = useState<{id: string, name: string} | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMonth || !selectedStoreId || !newProduct.name.trim()) return;

    setIsAddingProduct(true);
    
    try {
      const item = await addItem(
        currentMonth.id,
        selectedStoreId,
        newProduct.name.trim(),
        newProduct.quantity,
        newProduct.price
      );

      if (item) {
        // Limpiar formulario
        setNewProduct({ name: '', quantity: 1, price: 0, notes: '', priority: 2 });
        setSelectedStoreId('');
        
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // Scroll suave hacia el área de productos para ver el nuevo item
        const productSection = document.getElementById('products-section');
        if (productSection) {
          productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName.trim()) return;

    const monthSlug = newMonthName.toLowerCase().replace(/\s+/g, '_');
    const displayName = newMonthName;
    
    const month = await createMonth(monthSlug, displayName);
    if (month) {
      setNewMonthName('');
      setShowCreateMonth(false);
      loadMonthSummary(month.id);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const store = await createStore(newStoreName.trim());
    if (store) {
      setNewStoreName('');
      setShowCreateStore(false);
    }
  };

  const handleTogglePurchased = async (itemId: string, currentStatus: boolean) => {
    await togglePurchased(itemId, !currentStatus);
  };

  const handleEditItem = (item: GroceryItem) => {
    setEditingItem(item);
  };

  const handleSaveEdit = async (itemId: string, updates: any) => {
    await updateItem(itemId, updates);
    setEditingItem(null);
  };

  const handleGeneratePDF = async () => {
    if (!currentMonth) return;
    
    try {
      const report = await generatePDFReport(currentMonth.id);
      if (report) {
        console.log('Reporte generado:', report);
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
    }
  };

  const handleDeleteMonth = (monthId: string, monthName: string) => {
    setMonthToDelete({ id: monthId, name: monthName });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMonth = async () => {
    if (!monthToDelete) return;
    
    try {
      await deleteMonth(monthToDelete.id);
      setShowDeleteConfirm(false);
      setMonthToDelete(null);
      // Regresar a la vista principal de meses
      if (currentMonth?.id === monthToDelete.id) {
        // Si estamos eliminando el mes actual, volver a la vista de selección
        window.location.reload(); // O puedes usar un estado para controlar la vista
      }
    } catch (err) {
      console.error('Error al eliminar mes:', err);
      setShowDeleteConfirm(false);
      setMonthToDelete(null);
    }
  };

  const cancelDeleteMonth = () => {
    setShowDeleteConfirm(false);
    setMonthToDelete(null);
  };

  const filteredAndSortedItems = (items: GroceryItem[]) => {
    let filtered = showOnlyPending ? items.filter(item => !item.purchased) : items;
    
    return filtered.sort((a, b) => {
      if (sortBy === 'priority') {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return a.product_name.localeCompare(b.product_name);
      } else if (sortBy === 'name') {
        return a.product_name.localeCompare(b.product_name);
      } else {
        return b.total_amount - a.total_amount;
      }
    });
  };

  // Agregar estas funciones aquí, dentro del componente
  const handleEnterMonth = (month: GroceryMonth) => {
    setViewMode('detail');
    loadMonthSummary(month.id);
  };

  const handleBackToCards = () => {
    setViewMode('cards');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vista de Cards - Mostrar todos los meses
  if (viewMode === 'cards') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
            >
              ← Volver al Dashboard
            </button>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setShowCreateMonth(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span>📅</span>
                <span>Nuevo Mes</span>
              </button>
              
              <button
                onClick={() => setShowCreateStore(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span>🏪</span>
                <span>Nuevo Supermercado</span>
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mis Gastos Supermercado</h1>
            <p className="text-gray-600">Selecciona un mes para ver los detalles</p>
          </div>
        </div>

        {/* Cards de Meses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {months.map((month) => (
            <div
              key={month.id}
              onClick={() => handleEnterMonth(month)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200 hover:border-blue-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{month.display_name}</h3>
                  <span className="text-2xl">📅</span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Creado:</span>
                    <span>{new Date(month.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Última actualización:</span>
                    <span>{new Date(month.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-blue-600 font-medium">
                    <span>Ver detalles →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {months.length === 0 && (
            <div className="col-span-full">
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <span className="text-4xl mb-4 block">📅</span>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay meses creados</h3>
                <p className="text-gray-500 mb-4">Crea tu primer mes para comenzar a gestionar tus gastos de supermercado</p>
                <button
                  onClick={() => setShowCreateMonth(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Crear Primer Mes
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Modales */}
        {showCreateMonth && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Crear Nuevo Mes</h3>
              <form onSubmit={handleCreateMonth}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del mes
                  </label>
                  <input
                    type="text"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Enero 2024"
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateMonth(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear Mes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCreateStore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Crear Nuevo Supermercado</h3>
              <form onSubmit={handleCreateStore}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del supermercado
                  </label>
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Walmart, Soriana, etc."
                    required
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateStore(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Crear Supermercado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vista Detallada - Mostrar el mes seleccionado (código existente)
  return (
    <div className="space-y-6">
      {/* Header con botón de regreso a cards */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToCards}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
            >
              ← Volver a Meses
            </button>
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
            >
              🏠 Dashboard
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowCreateMonth(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>📅</span>
              <span>Nuevo Mes</span>
            </button>
            
            <button
              onClick={() => setShowCreateStore(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>🏪</span>
              <span>Nuevo Supermercado</span>
            </button>
            
            <button
              onClick={handleGeneratePDF}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <span>📄</span>
              <span>Generar PDF</span>
            </button>
            
            {currentMonth && (
              <button
                onClick={() => handleDeleteMonth(currentMonth.id, currentMonth.display_name)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <span>🗑️</span>
                <span>Eliminar Mes</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mis Gastos Supermercado</h1>
          {currentMonth && (
            <p className="text-gray-600">Mes actual: {currentMonth.display_name}</p>
          )}
        </div>
      </div>
      
      {/* Resumen del mes */}
      {monthSummary && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen del Mes</h2>
          
          {/* Resumen general */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {monthSummary.stores.reduce((total, store) => total + store.items.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {monthSummary.stores.reduce((total, store) => 
                  total + store.items.filter(item => item.purchased).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Comprados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {monthSummary.stores.reduce((total, store) => 
                  total + store.items.filter(item => !item.purchased).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">${monthSummary.grandTotal.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total General</div>
            </div>
          </div>

          {/* Resumen por supermercado */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3">Balance por Supermercado</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {monthSummary.stores.map((store) => {
                const storeItemCount = store.items.length;
                const storePurchasedCount = store.items.filter(item => item.purchased).length;
                const storePendingCount = store.items.filter(item => !item.purchased).length;
                const storeTotal = store.total || store.items.reduce((sum, item) => sum + item.total_amount, 0);
                
                return (
                  <div key={store.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 truncate">{store.name}</h4>
                      <span className="text-lg">🏪</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Items:</span>
                        <span className="font-medium text-blue-600">{storeItemCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Comprados:</span>
                        <span className="font-medium text-green-600">{storePurchasedCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pendientes:</span>
                        <span className="font-medium text-orange-600">{storePendingCount}</span>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-gray-300">
                        <span className="text-sm font-semibold text-gray-700">Total Gastado:</span>
                        <span className="font-bold text-purple-600">${storeTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Resumen final de todos los supermercados */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-800">Resumen Total de Supermercados</h4>
                  <p className="text-sm text-gray-600">Balance consolidado de todos los supermercados</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {monthSummary.stores.length}
                    </div>
                    <div className="text-xs text-gray-600">Supermercados</div>
                  </div>
                  
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {monthSummary.stores.reduce((total, store) => total + store.items.length, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Items Totales</div>
                  </div>
                  
                  <div>
                    <div className="text-xl font-bold text-purple-600">
                      ${monthSummary.grandTotal.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">Monto Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filtros y controles */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlyPending}
                onChange={(e) => setShowOnlyPending(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Solo pendientes</span>
            </label>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'priority' | 'price')}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="priority">Prioridad</option>
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
            </select>
          </div>
        </div>
        
        {/* Formulario para agregar producto */}
        <form onSubmit={handleAddProduct} className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Agregar Producto</h3>
            {showSuccessMessage && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200 animate-pulse">
                <span>✅</span>
                <span className="text-sm font-medium">¡Producto agregado!</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supermercado
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isAddingProduct}
              >
                <option value="">Seleccionar supermercado</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                placeholder="Ej: Leche, Pan, Arroz..."
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isAddingProduct}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad
              </label>
              <input
                type="number"
                placeholder="1"
                min="1"
                step="1"
                value={newProduct.quantity === 1 ? '' : newProduct.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewProduct({ ...newProduct, quantity: 1 });
                  } else {
                    const numValue = parseInt(value);
                    setNewProduct({ ...newProduct, quantity: numValue > 0 ? numValue : 1 });
                  }
                }}
                onFocus={(e) => {
                  if (newProduct.quantity === 1) {
                    e.target.select();
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isAddingProduct}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario ($)
              </label>
              <input
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={newProduct.price === 0 ? '' : newProduct.price}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setNewProduct({ ...newProduct, price: 0 });
                  } else {
                    const numValue = parseFloat(value);
                    setNewProduct({ ...newProduct, price: numValue >= 0 ? numValue : 0 });
                  }
                }}
                onFocus={(e) => {
                  if (newProduct.price === 0) {
                    e.target.select();
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={isAddingProduct}
              />
            </div>
            
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAddingProduct}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isAddingProduct ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Agregando...</span>
                  </>
                ) : (
                  <>
                    <span>➕</span>
                    <span>Agregar</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Mostrar total calculado */}
          {(newProduct.quantity > 0 && newProduct.price > 0) && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">Total calculado:</span>
                <span className="font-bold text-blue-800">
                  ${(newProduct.quantity * newProduct.price).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Lista de supermercados y productos */}
      <div className="space-y-4">
        {monthSummary && monthSummary.stores.map((store) => {
          const storeItems = store.items ? filteredAndSortedItems(store.items) : [];
          
          if (showOnlyPending && storeItems.length === 0) return null;
          
          return (
            <div key={store.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{store.name}</h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm opacity-90">
                      {storeItems.length} productos
                    </span>
                    <button
                      onClick={() => deleteStore(store.id)}
                      className="text-red-200 hover:text-red-100 transition-colors"
                      title="Eliminar supermercado"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {storeItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    {showOnlyPending ? 'No hay productos pendientes' : 'No hay productos en este supermercado'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {storeItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          item.purchased
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => handleTogglePurchased(item.id, item.purchased)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              item.purchased
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {item.purchased && '✓'}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${
                                item.purchased ? 'line-through text-gray-500' : 'text-gray-800'
                              }`}>
                                {item.product_name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.priority === 3 ? 'bg-red-100 text-red-700' :
                                item.priority === 2 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {item.priority === 3 ? 'Alta' : item.priority === 2 ? 'Media' : 'Baja'}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Cantidad: {item.quantity} | Precio: ${item.unit_price.toFixed(2)} | Total: ${item.total_amount.toFixed(2)}
                            </div>
                            {item.notes && (
                              <div className="text-xs text-gray-500 mt-1">
                                Notas: {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Editar producto"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {stores.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <span className="text-4xl mb-4 block">🏪</span>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay supermercados</h3>
            <p className="text-gray-500 mb-4">Crea tu primer supermercado para comenzar a agregar productos</p>
            <button
              onClick={() => setShowCreateStore(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Crear Primer Supermercado
            </button>
          </div>
        )}
      </div>
      
      {/* Modales existentes */}
      {showCreateMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Mes</h3>
            <form onSubmit={handleCreateMonth}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del mes
                </label>
                <input
                  type="text"
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Enero 2024"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateMonth(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Crear Mes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showCreateStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Crear Nuevo Supermercado</h3>
            <form onSubmit={handleCreateStore}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del supermercado
                </label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Walmart, Soriana, etc."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateStore(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Crear Supermercado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {editingItem && (
        <GroceryItemEditor
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}
      
      {/* Modal de confirmación para eliminar mes */}
      {showDeleteConfirm && monthToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <span className="text-3xl">🗑️</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Eliminar Mes
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar el mes <strong>"{monthToDelete.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium">
                  Esta acción no se puede deshacer y eliminará todos los productos de este mes.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDeleteMonth}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteMonth}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
