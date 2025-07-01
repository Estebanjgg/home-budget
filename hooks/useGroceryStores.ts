import { useState, useEffect } from 'react';
import { supabase } from '@/lib/config/supabase';
import { useAuth } from './useAuth';
import { GroceryStore, GroceryMonth, GroceryItem, GroceryStoreWithItems, GroceryMonthSummary, GroceryItemFormData } from '@/lib/grocery-types';

export function useGroceryStores() {
  const { user } = useAuth();
  const [stores, setStores] = useState<GroceryStore[]>([]);
  const [months, setMonths] = useState<GroceryMonth[]>([]);
  const [currentMonth, setCurrentMonth] = useState<GroceryMonth | null>(null);
  const [monthSummary, setMonthSummary] = useState<GroceryMonthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar supermercados del usuario
  const loadStores = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('grocery_stores')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar supermercados');
    }
  };

  // Cargar meses disponibles
  const loadMonths = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('grocery_months')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMonths(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar meses');
    }
  };

  // Función para cargar datos iniciales
  const loadInitialData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      await Promise.all([loadStores(), loadMonths()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  // Cargar resumen del mes actual
  const loadMonthSummary = async (monthId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Cargar mes
      const { data: monthData, error: monthError } = await supabase
        .from('grocery_months')
        .select('*')
        .eq('id', monthId)
        .single();

      if (monthError) throw monthError;

      // Cargar items del mes con información de supermercados
      const { data: itemsData, error: itemsError } = await supabase
        .from('grocery_items')
        .select(`
          *,
          grocery_stores!inner(*)
        `)
        .eq('month_id', monthId)
        .eq('user_id', user.id);

      if (itemsError) throw itemsError;

      // Agrupar por supermercado
      const storesMap = new Map<string, GroceryStoreWithItems>();
      let grandTotal = 0;

      itemsData?.forEach(item => {
        const store = item.grocery_stores;
        const storeId = store.id;

        if (!storesMap.has(storeId)) {
          storesMap.set(storeId, {
            ...store,
            items: [],
            total: 0
          });
        }

        const storeData = storesMap.get(storeId)!;
        storeData.items.push(item);
        storeData.total += item.total_amount;
        grandTotal += item.total_amount;
      });

      const summary: GroceryMonthSummary = {
        month: monthData,
        stores: Array.from(storesMap.values()),
        grandTotal
      };

      setMonthSummary(summary);
      setCurrentMonth(monthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar resumen del mes');
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo supermercado
  const createStore = async (name: string) => {
    if (!user) return null;

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      
      const { data, error } = await supabase
        .from('grocery_stores')
        .insert({
          user_id: user.id,
          name,
          slug
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadStores();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear supermercado');
      return null;
    }
  };

  // Crear nuevo mes
  const createMonth = async (monthName: string, displayName: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('grocery_months')
        .insert({
          user_id: user.id,
          month_name: monthName,
          display_name: displayName
        })
        .select()
        .single();

      if (error) throw error;
      
      await loadMonths();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear mes');
      return null;
    }
  };

  // Agregar producto
  const addItem = async (monthId: string, storeId: string, productName: string, quantity: number, unitPrice: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({
          user_id: user.id,
          month_id: monthId,
          store_id: storeId,
          product_name: productName,
          quantity,
          unit_price: unitPrice
        })
        .select()
        .single();

      if (error) throw error;
      
      // Recargar resumen del mes
      if (currentMonth) {
        await loadMonthSummary(currentMonth.id);
      }
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al agregar producto');
      return null;
    }
  };

  // Eliminar producto
  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      
      // Recargar resumen del mes
      if (currentMonth) {
        await loadMonthSummary(currentMonth.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar producto');
    }
  };

  // Eliminar supermercado
  const deleteStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('grocery_stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
      
      await loadStores();
      
      // Recargar resumen del mes si está cargado
      if (currentMonth) {
        await loadMonthSummary(currentMonth.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar supermercado');
    }
  };

  // Eliminar mes completo
  const deleteMonth = async (monthId: string) => {
    try {
      // Primero eliminar todos los items del mes
      const { error: itemsError } = await supabase
        .from('grocery_items')
        .delete()
        .eq('month_id', monthId)
        .eq('user_id', user?.id);

      if (itemsError) throw itemsError;

      // Luego eliminar el mes
      const { error: monthError } = await supabase
        .from('grocery_months')
        .delete()
        .eq('id', monthId)
        .eq('user_id', user?.id);

      if (monthError) throw monthError;
      
      // Recargar lista de meses
      await loadMonths();
      
      // Si el mes eliminado era el actual, limpiar el estado
      if (currentMonth?.id === monthId) {
        setCurrentMonth(null);
        setMonthSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar mes');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  // Actualizar producto
  const updateItem = async (itemId: string, updates: Partial<GroceryItemFormData>) => {
    try {
      // Filtrar solo los campos que deben ser actualizados
      const allowedUpdates: any = {};
      
      if (updates.product_name !== undefined) allowedUpdates.product_name = updates.product_name;
      if (updates.quantity !== undefined) allowedUpdates.quantity = updates.quantity;
      if (updates.unit_price !== undefined) allowedUpdates.unit_price = updates.unit_price;
      if (updates.notes !== undefined) allowedUpdates.notes = updates.notes;
      if (updates.priority !== undefined) allowedUpdates.priority = updates.priority;
      
      // NO calcular total_amount - es una columna generada automáticamente
      // La base de datos lo calcula automáticamente como quantity * unit_price
      
      // Siempre actualizar updated_at
      allowedUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('grocery_items')
        .update(allowedUpdates)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      
      // Recargar resumen del mes
      if (currentMonth) {
        await loadMonthSummary(currentMonth.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar producto');
    }
  };

  // Marcar/desmarcar como comprado
  const togglePurchased = async (itemId: string, purchased: boolean) => {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .update({ 
          purchased,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;
      
      // Recargar resumen del mes
      if (currentMonth) {
        await loadMonthSummary(currentMonth.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar estado de compra');
    }
  };

  // Generar reporte PDF
  const generatePDFReport = async (monthId: string) => {
    try {
      // Cargar datos completos del mes si no están cargados
      if (!monthSummary || monthSummary.month.id !== monthId) {
        await loadMonthSummary(monthId);
      }
      
      // Verificar que tenemos los datos
      if (!monthSummary) {
        throw new Error('No se pudieron cargar los datos del mes');
      }
      
      // Importar dinámicamente el generador de PDF
      const { generateGroceryPDF } = await import('@/lib/pdf-generator');
      
      // Generar el PDF
      generateGroceryPDF(monthSummary);
      
      return {
        success: true,
        message: 'Reporte PDF generado exitosamente'
      };
    } catch (err) {
      console.error('Error al generar PDF:', err);
      setError(err instanceof Error ? err.message : 'Error al generar reporte');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Error al generar reporte'
      };
    }
  };

  return {
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
  };
}