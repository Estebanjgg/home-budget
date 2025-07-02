import React, { useState } from 'react';
import { GroceryItem, GroceryItemFormData } from '@/lib/grocery-types';

interface GroceryItemEditorProps {
  item: GroceryItem;
  onSave: (itemId: string, updates: Partial<GroceryItemFormData>) => Promise<void>;
  onCancel: () => void;
}

export default function GroceryItemEditor({ item, onSave, onCancel }: GroceryItemEditorProps) {
  const [formData, setFormData] = useState<GroceryItemFormData>({
    product_name: item.product_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes || '',
    priority: item.priority
  });
  const [priceDisplay, setPriceDisplay] = useState<string>(item.unit_price.toFixed(2));
  const [saving, setSaving] = useState(false);

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
      setPriceDisplay('');
      setFormData({ ...formData, unit_price: 0 });
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
    
    setPriceDisplay(value);
    const numericValue = parseGroceryPrice(value);
    setFormData({ ...formData, unit_price: numericValue });
  };
  
  const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !value.includes('.')) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        const formattedValue = numValue.toFixed(2);
        setPriceDisplay(formattedValue);
        setFormData({ ...formData, unit_price: numValue });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSave(item.id, formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-blue-500 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Editar Producto</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Unitario
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={priceDisplay}
                  onChange={handlePriceInputChange}
                  onBlur={handlePriceBlur}
                  onFocus={(e) => {
                    if (priceDisplay === '') {
                      e.target.select();
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={3}>🔴 Alta</option>
                <option value={2}>🟡 Media</option>
                <option value={1}>🟢 Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Marca específica, tamaño, etc..."
              />
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <strong>Total: ${(formData.quantity * formData.unit_price).toFixed(2)}</strong>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}