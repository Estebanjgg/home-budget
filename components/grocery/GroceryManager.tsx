'use client';

import React, { useState, useEffect } from 'react';
import { useGroceryStores } from '@/hooks/useGroceryStores';
import { useProductSuggestions } from '@/hooks/useProductSuggestions';
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

  const {
    suggestions,
    loading: suggestionsLoading,
    loadSuggestions,
    checkForDuplicates
  } = useProductSuggestions();

  const [showCreateMonth, setShowCreateMonth] = useState(false);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null);
  const [newMonthName, setNewMonthName] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    quantity: 1, 
    price: '', 
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
  
  // Estados para confirmación de eliminación de productos y supermercados
  const [showDeleteItemConfirm, setShowDeleteItemConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, name: string} | null>(null);
  const [showDeleteStoreConfirm, setShowDeleteStoreConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<{id: string, name: string} | null>(null);
  
  // Nuevos estados para sugerencias y duplicados
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean;
    message: string;
    existingItem?: GroceryItem;
  }>({ show: false, message: '' });
  const [filteredSuggestions, setFilteredSuggestions] = useState(suggestions);

  // Cargar sugerencias cuando cambie el mes o tienda
  useEffect(() => {
    if (currentMonth) {
      loadSuggestions(currentMonth.id, selectedStoreId);
    }
  }, [currentMonth, selectedStoreId]);

  // Filtrar sugerencias basadas en el input del usuario
  useEffect(() => {
    if (newProduct.name.trim().length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.product_name.toLowerCase().includes(newProduct.name.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions(suggestions.slice(0, 5)); // Mostrar top 5 por defecto
      setShowSuggestions(false);
    }
  }, [newProduct.name, suggestions]);

  // Verificar duplicados cuando el usuario escriba
  useEffect(() => {
    const checkDuplicates = async () => {
      if (newProduct.name.trim().length > 2 && currentMonth) {
        const duplicateCheck = await checkForDuplicates(
          newProduct.name,
          currentMonth.id,
          selectedStoreId
        );
        
        if (duplicateCheck.isDuplicate) {
          setDuplicateWarning({
            show: true,
            message: `⚠️ Producto similar encontrado: "${duplicateCheck.existingItem?.product_name}"`,
            existingItem: duplicateCheck.existingItem
          });
        } else {
          setDuplicateWarning({ show: false, message: '' });
        }
      } else {
        setDuplicateWarning({ show: false, message: '' });
      }
    };

    const timeoutId = setTimeout(checkDuplicates, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [newProduct.name, currentMonth, selectedStoreId]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMonth || !selectedStoreId || !newProduct.name.trim()) return;

    // Verificar duplicados antes de crear el item
    const duplicateCheck = await checkForDuplicates(
      newProduct.name,
      currentMonth.id,
      selectedStoreId
    );

    if (duplicateCheck.isDuplicate) {
      // Mostrar error y no permitir la creación
      setDuplicateWarning({
        show: true,
        message: `❌ No se puede crear: Ya existe "${duplicateCheck.existingItem?.product_name}". Usa un nombre diferente.`,
        existingItem: duplicateCheck.existingItem
      });
      return; // Salir sin crear el item
    }

    setIsAddingProduct(true);
    
    try {
      const priceValue = parseGroceryPrice(newProduct.price.toString());
      const item = await addItem(
        currentMonth.id,
        selectedStoreId,
        newProduct.name.trim(),
        newProduct.quantity,
        priceValue,
        newProduct.notes
      );

      if (item) {
        // Limpiar formulario
        setNewProduct({ name: '', quantity: 1, price: '', notes: '', priority: 2 });
        setSelectedStoreId('');
        setDuplicateWarning({ show: false, message: '' });
        setShowSuggestions(false);
        
        // Mostrar mensaje de éxito
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // Scroll suave a la sección de productos
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('Error al agregar producto:', err);
      setError('Error al agregar el producto');
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

  // Funciones de formateo para precios de supermercado
  const formatGroceryPrice = (value: number): string => {
    if (value === 0) return '';
    return value.toFixed(2);
  };

  const parseGroceryPrice = (value: string): number => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (value === '') {
      setNewProduct({ ...newProduct, price: '' });
      return;
    }
    
    // Remover caracteres no numéricos excepto punto
    value = value.replace(/[^0-9.]/g, '');
    
    // Asegurar solo un punto decimal
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    // Formatear automáticamente con decimales cuando sea apropiado
    let formattedValue = value;
    
    // Si el usuario termina de escribir un número entero, agregar .00
    if (value && !value.includes('.') && value.length > 0) {
      // Solo formatear si el campo pierde el foco o si es un número completo
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        // No formatear automáticamente mientras escribe, solo al perder foco
        formattedValue = value;
      }
    }
    
    setNewProduct({ ...newProduct, price: formattedValue });
  };
  
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !value.includes('.')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setNewProduct({ ...newProduct, price: numValue.toFixed(2) });
      }
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setNewProduct({
      name: suggestion.product_name,
      quantity: suggestion.avg_quantity,
      price: formatGroceryPrice(suggestion.avg_price),
      notes: '',
      priority: 2
    });
    setShowSuggestions(false);
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

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfMessage, setPdfMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleGeneratePDF = async () => {
    if (!currentMonth) return;
    
    setIsGeneratingPDF(true);
    setPdfMessage(null);
    
    try {
      const result = await generatePDFReport(currentMonth.id);
      if (result?.success) {
        setPdfMessage({
          type: 'success',
          text: '¡PDF generado y descargado exitosamente!'
        });
      } else {
        setPdfMessage({
          type: 'error',
          text: result?.error || 'Error al generar el PDF'
        });
      }
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setPdfMessage({
        type: 'error',
        text: 'Error inesperado al generar el PDF'
      });
    } finally {
      setIsGeneratingPDF(false);
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setPdfMessage(null), 5000);
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

  // Funciones para manejar eliminación de productos
  const handleDeleteItem = (itemId: string, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setShowDeleteItemConfirm(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteItem(itemToDelete.id);
      setShowDeleteItemConfirm(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setShowDeleteItemConfirm(false);
      setItemToDelete(null);
    }
  };

  const cancelDeleteItem = () => {
    setShowDeleteItemConfirm(false);
    setItemToDelete(null);
  };

  // Funciones para manejar eliminación de supermercados
  const handleDeleteStore = (storeId: string, storeName: string) => {
    setStoreToDelete({ id: storeId, name: storeName });
    setShowDeleteStoreConfirm(true);
  };

  const confirmDeleteStore = async () => {
    if (!storeToDelete) return;
    
    try {
      await deleteStore(storeToDelete.id);
      setShowDeleteStoreConfirm(false);
      setStoreToDelete(null);
    } catch (err) {
      console.error('Error al eliminar supermercado:', err);
      setShowDeleteStoreConfirm(false);
      setStoreToDelete(null);
    }
  };

  const cancelDeleteStore = () => {
    setShowDeleteStoreConfirm(false);
    setStoreToDelete(null);
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
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-blue-500 p-6 w-full max-w-md mx-4">
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
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl border-2 border-green-500 p-6 w-full max-w-md mx-4">
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
              disabled={isGeneratingPDF}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generando...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>Generar PDF</span>
                </>
              )}
            </button>
            
            {/* Mensaje de estado del PDF */}
            {pdfMessage && (
              <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                pdfMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              } animate-pulse`}>
                <div className="flex items-center gap-2">
                  <span>{pdfMessage.type === 'success' ? '✅' : '❌'}</span>
                  <span className="font-medium">{pdfMessage.text}</span>
                </div>
              </div>
            )}
            
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
        
        {/* Formulario para agregar producto mejorado */}
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
            
            <div className="relative">
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
                autoComplete="off"
              />
              
              {/* Advertencia de Duplicado */}
              {duplicateWarning.show && (
                <div className={`absolute z-20 w-full mt-1 p-2 rounded-md text-xs ${
                  duplicateWarning.message.includes('❌') 
                    ? 'bg-red-50 border border-red-200 text-red-800' 
                    : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                }`}>
                  <p className="font-medium">{duplicateWarning.message}</p>
                  {duplicateWarning.existingItem && (
                    <p className="mt-1 opacity-75">
                      Cantidad: {duplicateWarning.existingItem.quantity} | 
                      Precio: ${duplicateWarning.existingItem.unit_price}
                    </p>
                  )}
                </div>
              )}
              
              {/* Panel de Sugerencias */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="text-xs text-gray-600">💡 Sugerencias basadas en tus compras anteriores</p>
                  </div>
                  {filteredSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{suggestion.product_name}</span>
                        <span className="text-xs text-gray-500">×{suggestion.frequency}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Cant: {suggestion.avg_quantity} | Precio: ${suggestion.avg_price}
                        {suggestion.store_name && (
                          <span className="ml-2 text-blue-600">• {suggestion.store_name}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                value={newProduct.quantity}
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
                  e.target.select();
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
                  type="text"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={handlePriceInputChange}
                  onBlur={handlePriceBlur}
                  onFocus={(e) => {
                    if (newProduct.price === '') {
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
                Notas (opcional)
              </label>
              <textarea
                value={newProduct.notes}
                onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Marca específica, tamaño, etc..."
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
          
          {/* Mostrar sugerencias populares cuando el campo esté vacío */}
          {!showSuggestions && newProduct.name.trim() === '' && suggestions.length > 0 && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-800 mb-2">🔥 Productos más comprados:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs hover:bg-blue-200 transition-colors"
                  >
                    {suggestion.product_name} (×{suggestion.frequency})
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Mostrar total calculado */}
          {(newProduct.quantity > 0 && parseGroceryPrice(newProduct.price.toString()) > 0) && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-700">💰 Total calculado:</span>
                <span className="font-bold text-green-800">
                  ${(newProduct.quantity * parseGroceryPrice(newProduct.price.toString())).toFixed(2)}
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
                      onClick={() => handleDeleteStore(store.id, store.name)}
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
                            onClick={() => handleDeleteItem(item.id, item.product_name)}
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
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border-2 border-blue-200 pointer-events-auto">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl border-2 border-green-200 pointer-events-auto">
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
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-red-200 pointer-events-auto">
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
      
      {/* Modal de confirmación para eliminar producto */}
      {showDeleteItemConfirm && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-red-200 pointer-events-auto">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <span className="text-3xl">🗑️</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Eliminar Producto
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar el producto <strong>"{itemToDelete.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium">
                  Esta acción no se puede deshacer.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDeleteItem}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteItem}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Sí, Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmación para eliminar supermercado */}
      {showDeleteStoreConfirm && storeToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-red-200 pointer-events-auto">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                <span className="text-3xl">🏪</span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Eliminar Supermercado
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que quieres eliminar el supermercado <strong>"{storeToDelete.name}"</strong>?
                <br />
                <span className="text-red-600 font-medium">
                  Esta acción eliminará todos los productos de este supermercado y no se puede deshacer.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDeleteStore}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteStore}
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
