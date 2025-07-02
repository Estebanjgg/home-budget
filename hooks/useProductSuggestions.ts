import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/config/supabase';
import { GroceryItem } from '@/lib/grocery-types';

interface ProductSuggestion {
  product_name: string;
  frequency: number;
  avg_quantity: number;
  avg_price: number;
  last_purchased: string;
  store_name?: string;
}

interface DuplicateCheck {
  isDuplicate: boolean;
  existingItem?: GroceryItem;
  similarity: number;
}

// Nueva interfaz para el resultado de la consulta
interface GroceryItemWithStore {
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  store_id: string;
  grocery_stores: {
    name: string;
  }[] | null; // Array en lugar de objeto único
}

export function useProductSuggestions() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar sugerencias basadas en historial
  const loadSuggestions = async (currentMonthId?: string, storeId?: string) => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('grocery_items')
        .select(`
          product_name,
          quantity,
          unit_price,
          created_at,
          store_id,
          grocery_stores!inner(name)
        `)
        .eq('user_id', user.id)
        .eq('purchased', true); // Solo productos que fueron comprados

      // Excluir el mes actual para evitar duplicados
      if (currentMonthId) {
        query = query.neq('month_id', currentMonthId);
      }

      // Filtrar por tienda si se especifica
      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100); // Últimos 100 productos

      if (error) throw error;

      // Procesar datos para crear sugerencias
      const productMap = new Map<string, {
        count: number;
        totalQuantity: number;
        totalPrice: number;
        lastPurchased: string;
        storeName?: string;
      }>();

      (data as GroceryItemWithStore[])?.forEach(item => {
        const key = item.product_name.toLowerCase().trim();
        const existing = productMap.get(key);
        
        if (existing) {
          existing.count++;
          existing.totalQuantity += item.quantity;
          existing.totalPrice += item.unit_price;
          if (item.created_at > existing.lastPurchased) {
            existing.lastPurchased = item.created_at;
            existing.storeName = item.grocery_stores?.[0]?.name; // Acceder al primer elemento del array
          }
        } else {
          productMap.set(key, {
            count: 1,
            totalQuantity: item.quantity,
            totalPrice: item.unit_price,
            lastPurchased: item.created_at,
            storeName: item.grocery_stores?.[0]?.name // Acceder al primer elemento del array
          });
        }
      });

      // Convertir a sugerencias ordenadas por frecuencia
      const suggestionsList: ProductSuggestion[] = Array.from(productMap.entries())
        .map(([productName, data]) => ({
          product_name: productName,
          frequency: data.count,
          avg_quantity: Math.round(data.totalQuantity / data.count),
          avg_price: Number((data.totalPrice / data.count).toFixed(2)),
          last_purchased: data.lastPurchased,
          store_name: data.storeName
        }))
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10); // Top 10 sugerencias

      setSuggestions(suggestionsList);
    } catch (err) {
      console.error('Error al cargar sugerencias:', err);
    } finally {
      setLoading(false);
    }
  };

  // Detectar productos duplicados
  const checkForDuplicates = async (
    productName: string, 
    currentMonthId: string, 
    storeId?: string
  ): Promise<DuplicateCheck> => {
    if (!user || !productName.trim()) {
      return { isDuplicate: false, similarity: 0 };
    }

    try {
      let query = supabase
        .from('grocery_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_id', currentMonthId);

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const normalizedInput = productName.toLowerCase().trim();
      
      // Buscar coincidencias exactas
      const exactMatch = data?.find(item => 
        item.product_name.toLowerCase().trim() === normalizedInput
      );

      if (exactMatch) {
        return {
          isDuplicate: true,
          existingItem: exactMatch,
          similarity: 1.0
        };
      }

      // Buscar coincidencias similares (contiene o está contenido)
      const similarMatch = data?.find(item => {
        const existing = item.product_name.toLowerCase().trim();
        return existing.includes(normalizedInput) || normalizedInput.includes(existing);
      });

      if (similarMatch) {
        const similarity = calculateSimilarity(normalizedInput, similarMatch.product_name.toLowerCase().trim());
        return {
          isDuplicate: similarity > 0.7,
          existingItem: similarMatch,
          similarity
        };
      }

      return { isDuplicate: false, similarity: 0 };
    } catch (err) {
      console.error('Error al verificar duplicados:', err);
      return { isDuplicate: false, similarity: 0 };
    }
  };

  // Función para calcular similitud entre strings
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  // Algoritmo de distancia de Levenshtein
  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  };

  return {
    suggestions,
    loading,
    loadSuggestions,
    checkForDuplicates
  };
}