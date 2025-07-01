import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GroceryMonthSummary, GroceryStoreWithItems } from './grocery-types';

// Extender el tipo jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class GroceryPDFGenerator {
  private doc: jsPDF;
  private pageHeight: number;
  private currentY: number;
  private margin: number = 20;
  private primaryColor: string = '#2563eb';
  private secondaryColor: string = '#64748b';
  private successColor: string = '#059669';
  private warningColor: string = '#d97706';

  constructor() {
    this.doc = new jsPDF();
    // Aplicar el plugin autoTable manualmente
    autoTable(this.doc, {});
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = this.margin;
  }

  private checkPageBreak(requiredHeight: number = 30): void {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addHeader(monthName: string): void {
    // Logo/Título principal
    this.doc.setFillColor(37, 99, 235); // blue-600
    this.doc.rect(0, 0, 210, 40, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('REPORTE DE GASTOS SUPERMERCADO', 105, 20, { align: 'center' });
    
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(monthName, 105, 30, { align: 'center' });
    
    // Fecha de generación
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 116, 139);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.doc.text(`Generado el: ${currentDate}`, 105, 50, { align: 'center' });
    
    this.currentY = 60;
  }

  private addSummarySection(summary: GroceryMonthSummary): void {
    this.checkPageBreak(60);
    
    // Título de sección - SIN EMOJIS
    this.doc.setTextColor(37, 99, 235);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RESUMEN GENERAL', this.margin, this.currentY);
    this.currentY += 15;
    
    // Calcular métricas
    const totalItems = summary.stores.reduce((total, store) => total + store.items.length, 0);
    const purchasedItems = summary.stores.reduce((total, store) => 
      total + store.items.filter(item => item.purchased).length, 0
    );
    const pendingItems = totalItems - purchasedItems;
    const completionPercentage = totalItems > 0 ? (purchasedItems / totalItems * 100).toFixed(1) : '0';
    
    // Crear tabla de resumen
    const summaryData = [
      ['Total de Supermercados', summary.stores.length.toString()],
      ['Total de Productos', totalItems.toString()],
      ['Productos Comprados', purchasedItems.toString()],
      ['Productos Pendientes', pendingItems.toString()],
      ['Porcentaje Completado', `${completionPercentage}%`],
      ['Monto Total', `$${summary.grandTotal.toFixed(2)}`],
      ['Promedio por Supermercado', `$${(summary.grandTotal / summary.stores.length).toFixed(2)}`]
    ];
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Metrica', 'Valor']],
      body: summaryData,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 11
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: this.margin, right: this.margin }
    });
    
    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addStoreSection(store: GroceryStoreWithItems): void {
    this.checkPageBreak(80);
    
    // Título del supermercado - SIN EMOJIS
    this.doc.setTextColor(37, 99, 235);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`SUPERMERCADO: ${store.name.toUpperCase()}`, this.margin, this.currentY);
    this.currentY += 10;
    
    // Métricas del supermercado
    const storeTotal = store.total || store.items.reduce((sum, item) => sum + item.total_amount, 0);
    const storePurchased = store.items.filter(item => item.purchased).length;
    const storePending = store.items.length - storePurchased;
    
    this.doc.setTextColor(100, 116, 139);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Total: $${storeTotal.toFixed(2)} | Items: ${store.items.length} | Comprados: ${storePurchased} | Pendientes: ${storePending}`, this.margin, this.currentY);
    this.currentY += 15;
    
    if (store.items.length === 0) {
      this.doc.setTextColor(156, 163, 175);
      this.doc.text('No hay productos en este supermercado', this.margin, this.currentY);
      this.currentY += 20;
      return;
    }
    
    // Tabla de productos - SIN EMOJIS
    const tableData = store.items.map(item => [
      item.product_name,
      item.quantity.toString(),
      `$${item.unit_price.toFixed(2)}`,
      `$${item.total_amount.toFixed(2)}`,
      item.purchased ? 'SI' : 'NO',
      item.priority === 3 ? 'ALTA' : item.priority === 2 ? 'MEDIA' : 'BAJA'
    ]);
    
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Producto', 'Cant.', 'Precio Unit.', 'Total', 'Comprado', 'Prioridad']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' }
      },
      margin: { left: this.margin, right: this.margin },
      didParseCell: (data) => {
        // Colorear filas según estado
        if (data.row.index >= 0 && data.column.index === 4) {
          const item = store.items[data.row.index];
          if (item.purchased) {
            data.cell.styles.textColor = [5, 150, 105]; // green-600
          } else {
            data.cell.styles.textColor = [239, 68, 68]; // red-500
          }
        }
      }
    });
    
    // Subtotal del supermercado
    this.currentY = (this.doc as any).lastAutoTable.finalY + 5;
    this.doc.setFillColor(243, 244, 246);
    this.doc.rect(this.margin, this.currentY, 170, 15, 'F');
    
    this.doc.setTextColor(37, 99, 235);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Subtotal ${store.name}: $${storeTotal.toFixed(2)}`, this.margin + 5, this.currentY + 10);
    
    this.currentY += 25;
  }

  private addFooter(): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Línea separadora
      this.doc.setDrawColor(229, 231, 235);
      this.doc.line(this.margin, this.pageHeight - 25, 210 - this.margin, this.pageHeight - 25);
      
      // Texto del pie de página
      this.doc.setTextColor(156, 163, 175);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text('Generado por Sistema de Gestion de Gastos Supermercado by Esteban Gonzalez', this.margin, this.pageHeight - 15);
      this.doc.text(`Pagina ${i} de ${pageCount}`, 210 - this.margin, this.pageHeight - 15, { align: 'right' });
    }
  }

  public generateReport(summary: GroceryMonthSummary): void {
    // Header
    this.addHeader(summary.month.display_name);
    
    // Resumen general
    this.addSummarySection(summary);
    
    // Sección por cada supermercado
    summary.stores.forEach((store, index) => {
      if (index > 0) {
        this.checkPageBreak(100);
      }
      this.addStoreSection(store);
    });
    
    // Footer
    this.addFooter();
  }

  public save(filename: string): void {
    this.doc.save(filename);
  }

  public getBlob(): Blob {
    return this.doc.output('blob');
  }
}

export const generateGroceryPDF = (summary: GroceryMonthSummary): void => {
  const generator = new GroceryPDFGenerator();
  generator.generateReport(summary);
  
  const filename = `reporte-supermercado-${summary.month.month_name}-${new Date().getTime()}.pdf`;
  generator.save(filename);
};