import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from tkinter import font
from datetime import datetime
import os
import json
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class ControlGastos:
    def __init__(self, root):
        print("DEBUG: Iniciando constructor ControlGastos")
        self.root = root
        self.root.title("Control de Gastos de Supermercado")
        self.root.geometry("1400x900")
        self.root.configure(bg='#f4f4f4')
        
        # Configurar el protocolo de cierre de ventana
        self.root.protocol("WM_DELETE_WINDOW", self.cerrar_aplicacion)
        
        # Datos para supermercados dinámicos
        self.datos = {}
        self.supermercados = []  # Lista de nombres de supermercados
        
        # Referencias a widgets de supermercados
        self.widgets_supermercados = {}
        
        # Directorio para guardar datos
        self.datos_dir = Path("datos_compras")
        self.datos_dir.mkdir(exist_ok=True)
        
        # Mes actual
        self.mes_actual = None
        
        # Ocultar ventana principal inicialmente
        print("DEBUG: Ocultando ventana principal")
        self.root.withdraw()
        
        # Mostrar diálogo inicial
        print("DEBUG: Llamando a mostrar_dialogo_inicial")
        self.mostrar_dialogo_inicial()
        print("DEBUG: Constructor terminado")
        
    def mostrar_dialogo_inicial(self):
        """Muestra diálogo inicial para seleccionar mes"""
        print("DEBUG: Iniciando mostrar_dialogo_inicial")
        meses_disponibles = self.obtener_meses_disponibles()
        print(f"DEBUG: Meses disponibles: {meses_disponibles}")
        
        if not meses_disponibles:
            print("DEBUG: No hay meses disponibles, creando nuevo mes")
            # No hay datos guardados, crear nuevo mes
            resultado = self.crear_nuevo_mes()
            if not resultado:
                print("DEBUG: Usuario canceló creación de mes, cerrando aplicación")
                self.root.destroy()
                return
            else:
                print("DEBUG: Mes creado exitosamente, mostrando interfaz")
                # Mostrar ventana principal y crear interfaz
                self.root.deiconify()
                self.crear_interfaz()
        else:
            print("DEBUG: Hay meses disponibles, mostrando menú principal")
            # Mostrar menú principal elaborado
            self.mostrar_menu_principal(meses_disponibles)
        print("DEBUG: mostrar_dialogo_inicial terminado")
    
    def mostrar_menu_principal(self, meses_disponibles):
        """Muestra un menú principal elaborado"""
        print("DEBUG: Iniciando mostrar_menu_principal")
        print(f"DEBUG: Meses recibidos: {meses_disponibles}")
        
        # Crear ventana independiente en lugar de Toplevel
        print("DEBUG: Creando ventana de menú independiente")
        ventana_menu = tk.Tk()  # Cambiar de Toplevel a Tk independiente
        ventana_menu.title("Control de Gastos - Menú Principal")
        ventana_menu.geometry("600x500")
        ventana_menu.configure(bg='#f8f9fa')
        
        print("DEBUG: Configurando propiedades de ventana de menú")
        
        # Centrar ventana
        print("DEBUG: Centrando ventana de menú")
        ventana_menu.update_idletasks()
        x = (ventana_menu.winfo_screenwidth() // 2) - (600 // 2)
        y = (ventana_menu.winfo_screenheight() // 2) - (500 // 2)
        ventana_menu.geometry(f"600x500+{x}+{y}")
        
        # Variable para almacenar la selección
        seleccion = {'opcion': None}
        
        # Título principal
        titulo = tk.Label(ventana_menu, text="🛒 Control de Gastos", 
                         font=('Arial', 20, 'bold'), bg='#f8f9fa', fg='#2c3e50')
        titulo.pack(pady=20)
        
        # Subtítulo
        subtitulo = tk.Label(ventana_menu, text="Selecciona una opción para continuar", 
                           font=('Arial', 12), bg='#f8f9fa', fg='#7f8c8d')
        subtitulo.pack(pady=(0, 30))
        
        # Frame para botones
        frame_botones = tk.Frame(ventana_menu, bg='#f8f9fa')
        frame_botones.pack(expand=True, fill='both', padx=40, pady=20)
        
        def manejar_nuevo_mes():
            resultado = self.crear_nuevo_mes()
            if resultado:
                ventana_menu.destroy()
                self.root.deiconify()  # Mostrar ventana principal
                self.crear_interfaz()  # Crear la interfaz
            # Si canceló, mantener el menú abierto
        
        def manejar_cargar_mes():
            resultado = self.cargar_mes_existente(meses_disponibles)
            
            if resultado:
                # Si se cargó exitosamente, cerrar menú y crear interfaz
                ventana_menu.destroy()
                self.root.deiconify()
                self.crear_interfaz()
            # Si se canceló, mantener el menú abierto
        
        def manejar_salir():
            ventana_menu.destroy()
            self.root.destroy()
        
        # Botón Nuevo Mes
        btn_nuevo = tk.Button(frame_botones, text="📅 Crear Nuevo Mes", 
                             font=('Arial', 14, 'bold'), bg='#3498db', fg='white',
                             relief=tk.RAISED, bd=3, pady=15,
                             command=manejar_nuevo_mes)
        btn_nuevo.pack(fill='x', pady=10)
        
        # Botón Cargar Mes
        btn_cargar = tk.Button(frame_botones, text="📂 Cargar Mes Existente", 
                              font=('Arial', 14, 'bold'), bg='#27ae60', fg='white',
                              relief=tk.RAISED, bd=3, pady=15,
                              command=manejar_cargar_mes)
        btn_cargar.pack(fill='x', pady=10)
        
        # Información de meses disponibles
        if meses_disponibles:
            info_frame = tk.Frame(frame_botones, bg='#ecf0f1', relief=tk.RAISED, bd=1)
            info_frame.pack(fill='x', pady=15)
            
            tk.Label(info_frame, text="📋 Meses disponibles:", 
                    font=('Arial', 10, 'bold'), bg='#ecf0f1', fg='#2c3e50').pack(pady=5)
            
            meses_texto = ", ".join(meses_disponibles[-5:])  # Mostrar últimos 5
            if len(meses_disponibles) > 5:
                meses_texto += f" (+{len(meses_disponibles)-5} más)"
            
            tk.Label(info_frame, text=meses_texto, 
                    font=('Arial', 9), bg='#ecf0f1', fg='#7f8c8d',
                    wraplength=400).pack(pady=(0, 10))
        
        # Botón Salir
        btn_salir = tk.Button(frame_botones, text="❌ Salir", 
                             font=('Arial', 12), bg='#e74c3c', fg='white',
                             relief=tk.RAISED, bd=2, pady=10,
                             command=manejar_salir)
        btn_salir.pack(fill='x', pady=(20, 0))
        
        # Manejar cierre de ventana
        ventana_menu.protocol("WM_DELETE_WINDOW", manejar_salir)
    

    
    def obtener_meses_disponibles(self):
        """Obtiene lista de meses con datos guardados"""
        archivos = list(self.datos_dir.glob("compras_*.json"))
        meses = []
        for archivo in archivos:
            # Extraer mes del nombre del archivo
            nombre = archivo.stem.replace("compras_", "")
            meses.append(nombre)
        return sorted(meses)
    
    def crear_nuevo_mes(self):
        """Crea un nuevo mes para las compras"""
        while True:
            mes = simpledialog.askstring(
                "Nuevo Mes",
                "Ingresa el nombre del mes (ej: junio_2024, julio_2024):",
                initialvalue=f"{self.obtener_mes_actual()}"
            )
            
            if mes:
                # Validar que no esté vacío
                mes = mes.strip()
                if mes:
                    self.mes_actual = mes
                    self.actualizar_titulo()
                    # Los datos ya están vacíos por defecto
                    return True
                else:
                    messagebox.showwarning("Advertencia", "El nombre del mes no puede estar vacío.")
                    continue
            else:
                # Usuario canceló
                return False
    
    def cargar_mes_existente(self, meses_disponibles):
        """Permite seleccionar y cargar un mes existente"""
        # Variable para almacenar el resultado
        resultado = {'exito': False}
        
        # Crear ventana de selección mejorada
        ventana_seleccion = tk.Tk()  # Cambiar de Toplevel a Tk independiente
        ventana_seleccion.title("📂 Cargar Mes Existente")
        ventana_seleccion.geometry("400x500")
        ventana_seleccion.configure(bg='#f8f9fa')
        
        # Centrar ventana
        ventana_seleccion.update_idletasks()
        x = (ventana_seleccion.winfo_screenwidth() // 2) - (400 // 2)
        y = (ventana_seleccion.winfo_screenheight() // 2) - (500 // 2)
        ventana_seleccion.geometry(f"400x500+{x}+{y}")
        
        # Título
        titulo = tk.Label(ventana_seleccion, text="📂 Cargar Mes Existente", 
                         font=('Arial', 16, 'bold'), bg='#f8f9fa', fg='#2c3e50')
        titulo.pack(pady=20)
        
        # Instrucciones
        instrucciones = tk.Label(ventana_seleccion, 
                               text="Selecciona el mes que deseas cargar:", 
                               font=('Arial', 11), bg='#f8f9fa', fg='#7f8c8d')
        instrucciones.pack(pady=(0, 15))
        
        # Frame para la lista
        frame_lista = tk.Frame(ventana_seleccion, bg='#f8f9fa')
        frame_lista.pack(fill='both', expand=True, padx=30, pady=10)
        
        # Lista de meses con scrollbar
        scrollbar = tk.Scrollbar(frame_lista)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        listbox = tk.Listbox(frame_lista, height=15, font=('Arial', 10),
                           yscrollcommand=scrollbar.set, selectmode=tk.SINGLE)
        
        # Agregar meses ordenados (más recientes primero)
        meses_ordenados = sorted(meses_disponibles, reverse=True)
        for mes in meses_ordenados:
            # Formatear nombre para mostrar
            mes_formateado = mes.replace('_', ' ').title()
            listbox.insert(tk.END, mes_formateado)
        
        listbox.pack(side=tk.LEFT, fill='both', expand=True)
        scrollbar.config(command=listbox.yview)
        
        # Seleccionar el primer elemento por defecto
        if meses_ordenados:
            listbox.selection_set(0)
        
        # Información adicional
        info_frame = tk.Frame(ventana_seleccion, bg='#e8f4fd', relief=tk.RAISED, bd=1)
        info_frame.pack(fill='x', padx=30, pady=10)
        
        tk.Label(info_frame, text=f"💾 Total de meses guardados: {len(meses_disponibles)}", 
                font=('Arial', 9), bg='#e8f4fd', fg='#2980b9').pack(pady=8)
        
        def cargar_seleccionado():
            seleccion = listbox.curselection()
            if seleccion:
                mes_seleccionado = meses_ordenados[seleccion[0]]
                try:
                    self.cargar_datos_mes(mes_seleccionado)
                    resultado['exito'] = True
                    ventana_seleccion.destroy()
                except Exception as e:
                    messagebox.showerror("Error", f"Error al cargar el mes: {str(e)}")
            else:
                messagebox.showwarning("Advertencia", "Por favor selecciona un mes.")
        
        def cancelar():
            resultado['exito'] = False
            ventana_seleccion.destroy()
        
        def volver_menu():
            resultado['exito'] = False
            ventana_seleccion.destroy()
        
        # Frame para botones
        frame_botones = tk.Frame(ventana_seleccion, bg='#f8f9fa')
        frame_botones.pack(pady=20)
        
        # Botones con mejor diseño
        tk.Button(frame_botones, text="✅ Cargar Mes", bg='#27ae60', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=cargar_seleccionado).pack(side=tk.LEFT, padx=10)
        
        tk.Button(frame_botones, text="🔙 Volver al Menú", bg='#f39c12', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=volver_menu).pack(side=tk.LEFT, padx=10)
        
        tk.Button(frame_botones, text="❌ Cancelar", bg='#e74c3c', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=cancelar).pack(side=tk.LEFT, padx=10)
        
        # Manejar doble clic en la lista
        listbox.bind('<Double-Button-1>', lambda e: cargar_seleccionado())
        
        # Manejar cierre de ventana
        ventana_seleccion.protocol("WM_DELETE_WINDOW", volver_menu)
        
        # Esperar hasta que se cierre la ventana
        ventana_seleccion.wait_window()
        
        return resultado['exito']
    
    def obtener_mes_actual(self):
        """Obtiene el mes actual en formato texto"""
        meses = [
            "enero", "febrero", "marzo", "abril", "mayo", "junio",
            "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
        ]
        ahora = datetime.now()
        return f"{meses[ahora.month - 1]}_{ahora.year}"
    
    def actualizar_titulo(self):
        """Actualiza el título de la ventana con el mes actual"""
        if self.mes_actual:
            self.root.title(f"Control de Gastos - {self.mes_actual.replace('_', ' ').title()}")
    
    def cargar_datos_mes(self, mes):
        """Carga los datos de un mes específico"""
        archivo = self.datos_dir / f"compras_{mes}.json"
        try:
            with open(archivo, 'r', encoding='utf-8') as f:
                datos_cargados = json.load(f)
            
            self.mes_actual = mes
            
            # Verificar formato de datos (nuevo vs antiguo)
            if 'supermercados' in datos_cargados and 'compras' in datos_cargados:
                # Formato nuevo
                self.supermercados = datos_cargados['supermercados']
                self.datos = datos_cargados['compras']
            else:
                # Formato antiguo - convertir
                self.supermercados = list(datos_cargados.keys())
                self.datos = datos_cargados
            
            self.actualizar_titulo()
            
            messagebox.showinfo("Éxito", f"Datos del mes '{mes}' cargados correctamente.")
        except Exception as e:
            messagebox.showerror("Error", f"Error al cargar los datos: {str(e)}")
            self.root.quit()
    
    def guardar_datos(self, archivo_personalizado=None):
        """Guarda los datos actuales con verificación de duplicados"""
        if not self.mes_actual:
            return False
        
        # Recopilar datos de las tablas dinámicamente
        datos_actuales = {
            'supermercados': self.supermercados.copy(),
            'compras': {}
        }
        
        for supermercado in self.supermercados:
            datos_actuales['compras'][supermercado] = []
            if hasattr(self, f'tree_{supermercado}'):
                tree = getattr(self, f'tree_{supermercado}')
                productos_vistos = set()  # Para verificar duplicados
                
                for item in tree.get_children():
                    valores = tree.item(item)['values']
                    if valores and len(valores) >= 3:  # Asegurar que hay datos válidos
                        producto_nombre = str(valores[0]).strip().lower()
                        
                        # Verificar duplicados
                        if producto_nombre in productos_vistos:
                            continue  # Saltar duplicado
                        
                        productos_vistos.add(producto_nombre)
                        datos_actuales['compras'][supermercado].append({
                            'producto': valores[0],
                            'cantidad': valores[1],
                            'precio_unitario': valores[2]
                        })
        
        # Determinar archivo de destino
        if archivo_personalizado:
            archivo = self.datos_dir / archivo_personalizado
        else:
            archivo = self.datos_dir / f"compras_{self.mes_actual}.json"
        
        try:
            with open(archivo, 'w', encoding='utf-8') as f:
                json.dump(datos_actuales, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            messagebox.showerror("Error", f"Error al guardar los datos: {str(e)}")
            return False
    
    def guardar_como_nuevo_archivo(self):
        """Permite guardar los datos en un archivo nuevo sin alterar el original"""
        if not self.mes_actual:
            messagebox.showwarning("Advertencia", "No hay datos para guardar.")
            return
        
        # Crear ventana para nuevo archivo
        ventana_guardar = tk.Toplevel(self.root)
        ventana_guardar.title("💾 Guardar Como Nuevo Archivo")
        ventana_guardar.geometry("500x400")
        ventana_guardar.configure(bg='#f8f9fa')
        ventana_guardar.transient(self.root)
        ventana_guardar.grab_set()
        
        # Centrar ventana
        ventana_guardar.update_idletasks()
        x = (ventana_guardar.winfo_screenwidth() // 2) - (500 // 2)
        y = (ventana_guardar.winfo_screenheight() // 2) - (400 // 2)
        ventana_guardar.geometry(f"500x400+{x}+{y}")
        
        # Título
        titulo = tk.Label(ventana_guardar, text="💾 Guardar Como Nuevo Archivo", 
                         font=('Arial', 16, 'bold'), bg='#f8f9fa', fg='#2c3e50')
        titulo.pack(pady=20)
        
        # Información actual
        info_frame = tk.Frame(ventana_guardar, bg='#e8f4fd', relief=tk.RAISED, bd=1)
        info_frame.pack(fill='x', padx=30, pady=15)
        
        tk.Label(info_frame, text=f"📂 Archivo actual: compras_{self.mes_actual}.json", 
                font=('Arial', 11), bg='#e8f4fd', fg='#2980b9').pack(pady=8)
        
        # Campo para nuevo nombre
        tk.Label(ventana_guardar, text="Nombre para el nuevo archivo:", 
                font=('Arial', 12, 'bold'), bg='#f8f9fa').pack(pady=(20, 5))
        
        frame_entrada = tk.Frame(ventana_guardar, bg='#f8f9fa')
        frame_entrada.pack(pady=10)
        
        tk.Label(frame_entrada, text="compras_", font=('Arial', 11), bg='#f8f9fa').pack(side=tk.LEFT)
        
        entrada_nombre = tk.Entry(frame_entrada, font=('Arial', 11), width=20)
        entrada_nombre.pack(side=tk.LEFT, padx=5)
        entrada_nombre.insert(0, f"{self.mes_actual}_copia")
        
        tk.Label(frame_entrada, text=".json", font=('Arial', 11), bg='#f8f9fa').pack(side=tk.LEFT)
        
        # Opciones adicionales
        opciones_frame = tk.Frame(ventana_guardar, bg='#fff3cd', relief=tk.RAISED, bd=1)
        opciones_frame.pack(fill='x', padx=30, pady=20)
        
        tk.Label(opciones_frame, text="⚙️ Opciones de Guardado", 
                font=('Arial', 12, 'bold'), bg='#fff3cd', fg='#856404').pack(pady=8)
        
        verificar_duplicados = tk.BooleanVar(value=True)
        tk.Checkbutton(opciones_frame, text="Eliminar productos duplicados automáticamente", 
                      variable=verificar_duplicados, bg='#fff3cd', font=('Arial', 10)).pack(anchor='w', padx=10)
        
        mostrar_resumen = tk.BooleanVar(value=True)
        tk.Checkbutton(opciones_frame, text="Mostrar resumen después de guardar", 
                      variable=mostrar_resumen, bg='#fff3cd', font=('Arial', 10)).pack(anchor='w', padx=10, pady=(0, 8))
        
        def confirmar_guardado():
            nombre = entrada_nombre.get().strip()
            if not nombre:
                messagebox.showwarning("Advertencia", "Por favor ingresa un nombre para el archivo.")
                return
            
            # Validar nombre
            caracteres_invalidos = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
            if any(char in nombre for char in caracteres_invalidos):
                messagebox.showerror("Error", "El nombre contiene caracteres no válidos.")
                return
            
            archivo_nuevo = f"compras_{nombre}.json"
            archivo_path = self.datos_dir / archivo_nuevo
            
            # Verificar si ya existe
            if archivo_path.exists():
                respuesta = messagebox.askyesno(
                    "Archivo Existente", 
                    f"El archivo '{archivo_nuevo}' ya existe.\n\n¿Deseas sobrescribirlo?"
                )
                if not respuesta:
                    return
            
            # Guardar
            if self.guardar_datos(archivo_nuevo):
                ventana_guardar.destroy()
                
                mensaje = f"Datos guardados exitosamente en:\n{archivo_nuevo}\n\n" + \
                         f"Archivo original ({self.mes_actual}.json) no modificado."
                
                if mostrar_resumen.get():
                    # Mostrar resumen de datos guardados
                    total_productos = sum(len(self.datos.get(super_id, [])) for super_id in self.supermercados)
                    mensaje += f"\n\nResumen:\n" + \
                              f"• Supermercados: {len(self.supermercados)}\n" + \
                              f"• Total productos: {total_productos}"
                    
                    if verificar_duplicados.get():
                        mensaje += "\n• Duplicados eliminados automáticamente"
                
                messagebox.showinfo("Guardado Exitoso", mensaje)
            
        def cancelar():
            ventana_guardar.destroy()
        
        # Botones
        frame_botones = tk.Frame(ventana_guardar, bg='#f8f9fa')
        frame_botones.pack(pady=20)
        
        tk.Button(frame_botones, text="💾 Guardar", bg='#27ae60', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=confirmar_guardado).pack(side=tk.LEFT, padx=10)
        
        tk.Button(frame_botones, text="❌ Cancelar", bg='#6c757d', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=cancelar).pack(side=tk.LEFT, padx=10)
        
        # Enfocar en el campo de entrada
        entrada_nombre.focus_set()
        entrada_nombre.select_range(0, tk.END)
    
    def cargar_datos_en_interfaz(self):
        """Carga los datos guardados en la interfaz"""
        for supermercado in self.supermercados:
            if hasattr(self, f'tree_{supermercado}'):
                tree = getattr(self, f'tree_{supermercado}')
                
                # Limpiar tabla
                for item in tree.get_children():
                    tree.delete(item)
                
                # Cargar datos si existen
                if supermercado in self.datos:
                    for producto_data in self.datos[supermercado]:
                        cantidad = float(producto_data['cantidad'])
                        precio = float(producto_data['precio_unitario'])
                        monto_total = cantidad * precio
                        
                        tree.insert('', 'end', values=(
                            producto_data['producto'],
                            str(int(cantidad)),  # Convertir a string
                            f"{precio:.2f}",
                            f"{monto_total:.2f}",
                            ""  # Total acumulado se calculará después
                        ))
                
                # Recalcular totales
                self.recalcular_totales(supermercado)
    
    def crear_interfaz(self):
        # Limpiar la ventana
        for widget in self.root.winfo_children():
            widget.destroy()
        
        # Crear barra de menú
        self.crear_menu_bar()
        
        # Título principal
        titulo = tk.Label(self.root, text="Control de Gastos de Supermercado", 
                         font=('Arial', 18, 'bold'), bg='#f4f4f4', fg='#333')
        titulo.pack(pady=10)
        
        # Frame principal con scroll
        main_frame = tk.Frame(self.root, bg='#f4f4f4')
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20)
        
        # Canvas y scrollbar para scroll vertical
        canvas = tk.Canvas(main_frame, bg='#f4f4f4')
        scrollbar = ttk.Scrollbar(main_frame, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas, bg='#f4f4f4')
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")
        
        # Guardar referencia al frame scrollable
        self.scrollable_frame = scrollable_frame
        
        # Frame para gestión de supermercados
        self.crear_gestion_supermercados(scrollable_frame)
        
        # Crear secciones para supermercados existentes
        self.actualizar_interfaz_supermercados()
        
        # Resumen total
        self.crear_resumen_total(scrollable_frame)
        
        # Bind mousewheel to canvas
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
        # Cargar datos si existen
        if self.mes_actual and any(self.datos.values()):
            self.cargar_datos_en_interfaz()
    
    def crear_menu_bar(self):
        """Crea la barra de menú principal"""
        menubar = tk.Menu(self.root)
        self.root.config(menu=menubar)
        
        # Menú Archivo
        menu_archivo = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Archivo", menu=menu_archivo)
        menu_archivo.add_command(label="💾 Guardar", command=self.guardar_datos_con_mensaje, accelerator="Ctrl+S")
        menu_archivo.add_command(label="📂 Cargar Mes...", command=self.abrir_cargar_mes)
        menu_archivo.add_command(label="📅 Nuevo Mes...", command=self.crear_nuevo_mes_desde_interfaz)
        menu_archivo.add_separator()
        menu_archivo.add_command(label="❌ Salir", command=self.cerrar_aplicacion, accelerator="Alt+F4")
        
        # Menú Reportes
        menu_reportes = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Reportes", menu=menu_reportes)
        menu_reportes.add_command(label="🖨️ Imprimir Reporte Completo", command=self.imprimir_todas_compras)
        menu_reportes.add_separator()
        
        # Submenú para reportes por supermercado
        for super_id in self.supermercados:
            nombre_mostrar = super_id.replace("_", " ").title()
            menu_reportes.add_command(
                label=f"📋 Reporte {nombre_mostrar}", 
                command=lambda s=super_id, n=nombre_mostrar: self.imprimir_supermercado(s, n)
            )
        
        # Menú Supermercados
        menu_super = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Supermercados", menu=menu_super)
        menu_super.add_command(label="➕ Agregar Supermercado", command=self.agregar_supermercado_desde_menu)
        menu_super.add_command(label="➖ Eliminar Supermercado", command=self.eliminar_supermercado_desde_menu)
        
        # Menú Ayuda
        menu_ayuda = tk.Menu(menubar, tearoff=0)
        menubar.add_cascade(label="Ayuda", menu=menu_ayuda)
        menu_ayuda.add_command(label="ℹ️ Acerca de...", command=self.mostrar_acerca_de)
        
        # Configurar atajos de teclado
        self.root.bind('<Control-s>', lambda e: self.guardar_datos_con_mensaje())
        self.root.bind('<Alt-F4>', lambda e: self.cerrar_aplicacion())
    
    def cargar_mes_desde_menu(self):
        """Carga un mes existente desde el menú"""
        meses_disponibles = self.obtener_meses_disponibles()
        if not meses_disponibles:
            messagebox.showinfo("Información", "No hay meses guardados disponibles.")
            return
        
        resultado = self.cargar_mes_existente(meses_disponibles)
        if resultado:
            self.crear_interfaz()
    
    def agregar_supermercado_desde_menu(self):
        """Agregar supermercado desde el menú"""
        nombre = simpledialog.askstring(
            "Nuevo Supermercado",
            "Ingresa el nombre del supermercado:",
            parent=self.root
        )
        if nombre and nombre.strip():
            nombre_id = nombre.strip().lower().replace(" ", "_")
            if nombre_id not in self.supermercados:
                self.supermercados.append(nombre_id)
                self.datos[nombre_id] = []
                self.actualizar_interfaz_supermercados()
                self.crear_menu_bar()  # Recrear menú con nuevo supermercado
                messagebox.showinfo("Éxito", f"Supermercado '{nombre}' agregado correctamente.")
            else:
                messagebox.showwarning("Advertencia", "Este supermercado ya existe.")
    
    def eliminar_supermercado_desde_menu(self):
        """Eliminar supermercado desde el menú"""
        if not self.supermercados:
            messagebox.showinfo("Sin datos", "No hay supermercados para eliminar.")
            return
        
        # Crear lista de opciones
        opciones = [super_id.replace("_", " ").title() for super_id in self.supermercados]
        
        # Usar un diálogo simple para seleccionar
        seleccion = simpledialog.askstring(
            "Eliminar Supermercado",
            f"Supermercados disponibles: {', '.join(opciones)}\n\n" +
            "Ingresa el nombre del supermercado a eliminar:",
            parent=self.root
        )
        
        if seleccion:
            nombre_id = seleccion.strip().lower().replace(" ", "_")
            if nombre_id in self.supermercados:
                confirmar = messagebox.askyesno(
                    "Confirmar Eliminación",
                    f"¿Estás seguro de eliminar '{seleccion}'?\n" +
                    "Se perderán todos los datos de este supermercado."
                )
                if confirmar:
                    self.supermercados.remove(nombre_id)
                    if nombre_id in self.datos:
                        del self.datos[nombre_id]
                    self.actualizar_interfaz_supermercados()
                    self.crear_menu_bar()  # Recrear menú
                    messagebox.showinfo("Éxito", f"Supermercado '{seleccion}' eliminado.")
            else:
                messagebox.showwarning("Error", "Supermercado no encontrado.")
    
    def abrir_cargar_mes(self):
        """Abre el diálogo para cargar un mes desde el menú"""
        meses_disponibles = self.obtener_meses_disponibles()
        if meses_disponibles:
            resultado = self.cargar_mes_existente(meses_disponibles)
            if resultado:
                self.crear_interfaz()  # Recrear interfaz con nuevos datos
        else:
            messagebox.showinfo("Sin datos", "No hay meses guardados disponibles.")
    
    def cerrar_aplicacion(self):
        """Cierra la aplicación con confirmación de guardado"""
        # Verificar si hay datos sin guardar
        respuesta = messagebox.askyesnocancel(
            "Cerrar Aplicación",
            "¿Deseas guardar los datos antes de cerrar?\n\n" +
            "• Sí: Guardar y cerrar\n" +
            "• No: Cerrar sin guardar\n" +
            "• Cancelar: No cerrar"
        )
        
        if respuesta is True:  # Sí - Guardar y cerrar
            if self.guardar_datos():
                messagebox.showinfo("Guardado", "Datos guardados correctamente.")
                self.root.destroy()
            else:
                messagebox.showerror("Error", "Error al guardar. No se cerrará la aplicación.")
        elif respuesta is False:  # No - Cerrar sin guardar
            confirmar = messagebox.askyesno(
                "Confirmar",
                "¿Estás seguro de que quieres cerrar sin guardar?\n" +
                "Se perderán todos los cambios no guardados."
            )
            if confirmar:
                self.root.destroy()
        # Si es None (Cancelar), no hacer nada
    
    def mostrar_acerca_de(self):
        """Muestra información sobre la aplicación"""
        messagebox.showinfo(
            "Acerca de Control de Gastos",
            "Control de Gastos de Supermercado\n" +
            "Versión 2.0\n\n" +
            "Aplicación para gestionar y controlar\n" +
            "los gastos en diferentes supermercados.\n\n" +
            "Características:\n" +
            "• Gestión de múltiples supermercados\n" +
            "• Reportes detallados\n" +
            "• Guardado automático\n" +
            "• Interfaz intuitiva"
        )
    
    def crear_gestion_supermercados(self, parent):
        """Crea la sección para gestionar supermercados"""
        frame_gestion = tk.Frame(parent, bg='#e9ecef', relief=tk.RAISED, bd=2)
        frame_gestion.pack(fill=tk.X, pady=10, padx=10)
        
        # Título
        titulo_gestion = tk.Label(frame_gestion, text="Gestión de Supermercados", 
                                 font=('Arial', 16, 'bold'), bg='#e9ecef', fg='#333')
        titulo_gestion.pack(pady=10)
        
        # Frame para controles
        frame_controles = tk.Frame(frame_gestion, bg='#e9ecef')
        frame_controles.pack(pady=10)
        
        # Entry para nuevo supermercado
        tk.Label(frame_controles, text="Nombre del supermercado:", bg='#e9ecef').pack(side=tk.LEFT, padx=5)
        self.entry_nuevo_super = tk.Entry(frame_controles, width=25)
        self.entry_nuevo_super.pack(side=tk.LEFT, padx=5)
        
        # Botón agregar
        btn_agregar_super = tk.Button(frame_controles, text="Agregar Supermercado", 
                                     bg='#28a745', fg='white', 
                                     command=self.agregar_supermercado)
        btn_agregar_super.pack(side=tk.LEFT, padx=5)
        
        # Botón eliminar
        btn_eliminar_super = tk.Button(frame_controles, text="Eliminar Supermercado", 
                                      bg='#dc3545', fg='white', 
                                      command=self.eliminar_supermercado)
        btn_eliminar_super.pack(side=tk.LEFT, padx=5)
        
        # Lista de supermercados actuales
        frame_lista = tk.Frame(frame_gestion, bg='#e9ecef')
        frame_lista.pack(pady=5)
        
        tk.Label(frame_lista, text="Supermercados actuales:", bg='#e9ecef', 
                font=('Arial', 10, 'bold')).pack()
        
        self.label_supermercados = tk.Label(frame_lista, text="Ninguno", bg='#e9ecef', 
                                           fg='#666', wraplength=800)
        self.label_supermercados.pack(pady=5)
    
    def agregar_supermercado(self):
        """Agrega un nuevo supermercado"""
        nombre = self.entry_nuevo_super.get().strip()
        
        if not nombre:
            messagebox.showwarning("Advertencia", "Por favor, ingresa un nombre para el supermercado.")
            return
        
        # Crear ID único (sin espacios ni caracteres especiales)
        super_id = nombre.lower().replace(" ", "_").replace("ñ", "n")
        super_id = ''.join(c for c in super_id if c.isalnum() or c == '_')
        
        if super_id in self.supermercados:
            messagebox.showwarning("Advertencia", "Este supermercado ya existe.")
            return
        
        # Agregar a la lista
        self.supermercados.append(super_id)
        self.datos[super_id] = []
        
        # Limpiar entry
        self.entry_nuevo_super.delete(0, tk.END)
        
        # Actualizar interfaz
        self.actualizar_interfaz_supermercados()
        self.actualizar_lista_supermercados()
        
        # Guardar datos
        self.guardar_datos()
        
        messagebox.showinfo("Éxito", f"Supermercado '{nombre}' agregado correctamente.")
    
    def eliminar_supermercado(self):
        """Elimina un supermercado seleccionado con opciones avanzadas"""
        if not self.supermercados:
            messagebox.showwarning("Advertencia", "No hay supermercados para eliminar.")
            return
        
        # Crear ventana de selección mejorada
        ventana_eliminar = tk.Toplevel(self.root)
        ventana_eliminar.title("🗑️ Eliminar Supermercado")
        ventana_eliminar.geometry("450x550")
        ventana_eliminar.configure(bg='#f8f9fa')
        ventana_eliminar.transient(self.root)
        ventana_eliminar.grab_set()
        
        # Centrar ventana
        ventana_eliminar.update_idletasks()
        x = (ventana_eliminar.winfo_screenwidth() // 2) - (450 // 2)
        y = (ventana_eliminar.winfo_screenheight() // 2) - (550 // 2)
        ventana_eliminar.geometry(f"450x550+{x}+{y}")
        
        # Título
        titulo = tk.Label(ventana_eliminar, text="🗑️ Eliminar Supermercado", 
                         font=('Arial', 16, 'bold'), bg='#f8f9fa', fg='#e74c3c')
        titulo.pack(pady=20)
        
        # Instrucciones
        instrucciones = tk.Label(ventana_eliminar, 
                               text="Selecciona el supermercado que deseas eliminar:", 
                               font=('Arial', 11), bg='#f8f9fa', fg='#7f8c8d')
        instrucciones.pack(pady=(0, 15))
        
        # Frame para la lista
        frame_lista = tk.Frame(ventana_eliminar, bg='#f8f9fa')
        frame_lista.pack(fill='both', expand=True, padx=30, pady=10)
        
        # Lista de supermercados con información
        scrollbar = tk.Scrollbar(frame_lista)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        listbox = tk.Listbox(frame_lista, height=10, font=('Arial', 10),
                           yscrollcommand=scrollbar.set, selectmode=tk.SINGLE)
        
        # Agregar supermercados con información de productos
        for super_id in self.supermercados:
            nombre_mostrar = super_id.replace("_", " ").title()
            # Contar productos
            num_productos = 0
            if super_id in self.datos:
                num_productos = len(self.datos[super_id])
            
            texto_item = f"{nombre_mostrar} ({num_productos} productos)"
            listbox.insert(tk.END, texto_item)
        
        listbox.pack(side=tk.LEFT, fill='both', expand=True)
        scrollbar.config(command=listbox.yview)
        
        # Opciones de eliminación
        frame_opciones = tk.Frame(ventana_eliminar, bg='#fff3cd', relief=tk.RAISED, bd=1)
        frame_opciones.pack(fill='x', padx=30, pady=15)
        
        tk.Label(frame_opciones, text="⚠️ Opciones de Eliminación", 
                font=('Arial', 12, 'bold'), bg='#fff3cd', fg='#856404').pack(pady=8)
        
        # Variable para tipo de eliminación
        tipo_eliminacion = tk.StringVar(value="solo_mes")
        
        tk.Radiobutton(frame_opciones, text="Solo eliminar del mes actual", 
                      variable=tipo_eliminacion, value="solo_mes",
                      bg='#fff3cd', font=('Arial', 10)).pack(anchor='w', padx=10)
        
        tk.Radiobutton(frame_opciones, text="Eliminar completamente (todos los meses)", 
                      variable=tipo_eliminacion, value="completo",
                      bg='#fff3cd', font=('Arial', 10)).pack(anchor='w', padx=10, pady=(0, 8))
        
        def confirmar_eliminacion():
            seleccion = listbox.curselection()
            if seleccion:
                super_id = self.supermercados[seleccion[0]]
                nombre_mostrar = super_id.replace("_", " ").title()
                tipo = tipo_eliminacion.get()
                
                if tipo == "solo_mes":
                    mensaje = f"¿Eliminar '{nombre_mostrar}' solo del mes actual ({self.mes_actual})?\n\n" + \
                             "Los datos de otros meses no se verán afectados."
                else:
                    mensaje = f"¿Eliminar '{nombre_mostrar}' COMPLETAMENTE de todos los meses?\n\n" + \
                             "⚠️ ADVERTENCIA: Esta acción eliminará el supermercado de TODOS los archivos guardados."
                
                respuesta = messagebox.askyesno("Confirmar Eliminación", mensaje)
                
                if respuesta:
                    if tipo == "solo_mes":
                        self._eliminar_supermercado_mes_actual(super_id, nombre_mostrar)
                    else:
                        self._eliminar_supermercado_completo(super_id, nombre_mostrar)
                    
                    ventana_eliminar.destroy()
            else:
                messagebox.showwarning("Advertencia", "Por favor selecciona un supermercado.")
        
        def cancelar():
            ventana_eliminar.destroy()
        
        # Frame para botones
        frame_botones = tk.Frame(ventana_eliminar, bg='#f8f9fa')
        frame_botones.pack(pady=20)
        
        tk.Button(frame_botones, text="🗑️ Eliminar", bg='#e74c3c', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=confirmar_eliminacion).pack(side=tk.LEFT, padx=10)
        
        tk.Button(frame_botones, text="❌ Cancelar", bg='#6c757d', fg='white',
                 font=('Arial', 11, 'bold'), relief=tk.RAISED, bd=2, padx=20, pady=8,
                 command=cancelar).pack(side=tk.LEFT, padx=10)
    
    def _eliminar_supermercado_mes_actual(self, super_id, nombre_mostrar):
        """Elimina supermercado solo del mes actual"""
        try:
            # Limpiar widgets asociados antes de eliminar
            if super_id in self.widgets_supermercados:
                widget_info = self.widgets_supermercados[super_id]
                if 'frame' in widget_info:
                    widget_info['frame'].destroy()
                del self.widgets_supermercados[super_id]
            
            # Eliminar atributos de tree y otros widgets si existen
            attrs_to_remove = [
                f'tree_{super_id}',
                f'entry_producto_{super_id}',
                f'entry_cantidad_{super_id}',
                f'entry_precio_{super_id}',
                f'label_total_{super_id}'
            ]
            
            for attr in attrs_to_remove:
                if hasattr(self, attr):
                    delattr(self, attr)
            
            # Eliminar datos del mes actual
            if super_id in self.supermercados:
                self.supermercados.remove(super_id)
            if super_id in self.datos:
                del self.datos[super_id]
            
            # Actualizar interfaz
            self.actualizar_interfaz_supermercados()
            self.actualizar_lista_supermercados()
            
            # Guardar datos
            self.guardar_datos()
            
            messagebox.showinfo("Éxito", 
                               f"Supermercado '{nombre_mostrar}' eliminado del mes actual.\n\n" +
                               "Los datos de otros meses permanecen intactos.")
            
        except Exception as e:
            messagebox.showerror("Error", f"Error al eliminar supermercado: {str(e)}")
    
    def _eliminar_supermercado_completo(self, super_id, nombre_mostrar):
        """Elimina supermercado de todos los archivos guardados"""
        try:
            archivos_modificados = 0
            archivos_error = []
            
            # Limpiar widgets asociados antes de eliminar
            if super_id in self.widgets_supermercados:
                widget_info = self.widgets_supermercados[super_id]
                if 'frame' in widget_info:
                    widget_info['frame'].destroy()
                del self.widgets_supermercados[super_id]
            
            # Eliminar atributos de tree y otros widgets si existen
            attrs_to_remove = [
                f'tree_{super_id}',
                f'entry_producto_{super_id}',
                f'entry_cantidad_{super_id}',
                f'entry_precio_{super_id}',
                f'label_total_{super_id}'
            ]
            
            for attr in attrs_to_remove:
                if hasattr(self, attr):
                    delattr(self, attr)
            
            # Eliminar del mes actual
            if super_id in self.supermercados:
                self.supermercados.remove(super_id)
            if super_id in self.datos:
                del self.datos[super_id]
            
            # Actualizar interfaz
            self.actualizar_interfaz_supermercados()
            self.actualizar_lista_supermercados()
            
            # Guardar mes actual
            self.guardar_datos()
            archivos_modificados += 1
            
            # Eliminar de todos los otros archivos
            for archivo in self.datos_dir.glob("compras_*.json"):
                if archivo.stem != f"compras_{self.mes_actual}":
                    try:
                        with open(archivo, 'r', encoding='utf-8') as f:
                            datos_archivo = json.load(f)
                        
                        # Verificar si el supermercado existe en este archivo
                        modificado = False
                        
                        # Formato nuevo
                        if 'supermercados' in datos_archivo and 'compras' in datos_archivo:
                            if super_id in datos_archivo['supermercados']:
                                datos_archivo['supermercados'].remove(super_id)
                                modificado = True
                            if super_id in datos_archivo['compras']:
                                del datos_archivo['compras'][super_id]
                                modificado = True
                        
                        # Formato antiguo
                        elif super_id in datos_archivo:
                            del datos_archivo[super_id]
                            modificado = True
                        
                        # Guardar si se modificó
                        if modificado:
                            with open(archivo, 'w', encoding='utf-8') as f:
                                json.dump(datos_archivo, f, ensure_ascii=False, indent=2)
                            archivos_modificados += 1
                    
                    except Exception as e:
                        archivos_error.append(f"{archivo.name}: {str(e)}")
            
            # Mostrar resultado
            mensaje = f"Supermercado '{nombre_mostrar}' eliminado completamente.\n\n" + \
                     f"Archivos modificados: {archivos_modificados}"
            
            if archivos_error:
                mensaje += f"\n\nErrores en {len(archivos_error)} archivos:\n" + "\n".join(archivos_error)
                messagebox.showwarning("Eliminación Parcial", mensaje)
            else:
                messagebox.showinfo("Éxito", mensaje)
                
        except Exception as e:
            messagebox.showerror("Error", f"Error al eliminar supermercado completamente: {str(e)}")
    
    def actualizar_lista_supermercados(self):
        """Actualiza la lista visual de supermercados"""
        if self.supermercados:
            nombres = [super_id.replace("_", " ").title() for super_id in self.supermercados]
            texto = ", ".join(nombres)
        else:
            texto = "Ninguno"
        
        self.label_supermercados.config(text=texto)
    
    def actualizar_interfaz_supermercados(self):
        """Actualiza la interfaz para mostrar todos los supermercados"""
        # Eliminar widgets existentes de supermercados
        for widget_info in self.widgets_supermercados.values():
            if 'frame' in widget_info:
                widget_info['frame'].destroy()
        
        self.widgets_supermercados.clear()
        
        # Crear secciones para cada supermercado
        for super_id in self.supermercados:
            nombre_mostrar = super_id.replace("_", " ").title()
            self.crear_seccion_supermercado(self.scrollable_frame, super_id, f"Supermercado {nombre_mostrar}")
        
        # Actualizar lista visual
        self.actualizar_lista_supermercados()
        
        # Actualizar resumen si existe
        if hasattr(self, 'tree_resumen'):
            self.actualizar_resumen_supermercados()
    def crear_seccion_supermercado(self, parent, nombre_super, titulo):
        # Frame para la sección
        frame_seccion = tk.Frame(parent, bg='#f4f4f4', relief=tk.RAISED, bd=1)
        frame_seccion.pack(fill=tk.X, pady=10, padx=10)
        
        # Título del supermercado
        titulo_label = tk.Label(frame_seccion, text=titulo, 
                               font=('Arial', 14, 'bold'), bg='#f4f4f4', fg='#333')
        titulo_label.pack(pady=5)
        
        # Frame para inputs
        frame_inputs = tk.Frame(frame_seccion, bg='#f4f4f4')
        frame_inputs.pack(pady=5)
        
        # Inputs
        tk.Label(frame_inputs, text="Producto:", bg='#f4f4f4').grid(row=0, column=0, padx=5)
        entry_producto = tk.Entry(frame_inputs, width=20)
        entry_producto.grid(row=0, column=1, padx=5)
        
        tk.Label(frame_inputs, text="Cantidad:", bg='#f4f4f4').grid(row=0, column=2, padx=5)
        entry_cantidad = tk.Entry(frame_inputs, width=10)
        entry_cantidad.grid(row=0, column=3, padx=5)
        
        tk.Label(frame_inputs, text="Precio unitario:", bg='#f4f4f4').grid(row=0, column=4, padx=5)
        entry_precio = tk.Entry(frame_inputs, width=10)
        entry_precio.grid(row=0, column=5, padx=5)
        
        # Botón agregar
        btn_agregar = tk.Button(frame_inputs, text="Agregar Producto", 
                               bg='#28a745', fg='white', 
                               command=lambda: self.agregar_producto(nombre_super, entry_producto, entry_cantidad, entry_precio))
        btn_agregar.grid(row=0, column=6, padx=10)
        
        # Tabla (Treeview)
        frame_tabla = tk.Frame(frame_seccion, bg='#f4f4f4')
        frame_tabla.pack(fill=tk.BOTH, expand=True, pady=10)
        
        columns = ('Producto', 'Cantidad', 'Precio Unitario', 'Monto Total', 'Total Acumulado')
        tree = ttk.Treeview(frame_tabla, columns=columns, show='headings', height=6)
        
        # Configurar columnas
        for col in columns:
            tree.heading(col, text=col)
            tree.column(col, width=150, anchor='center')
        
        # Bind doble click para editar
        tree.bind('<Double-1>', lambda event: self.editar_producto(nombre_super, tree))
        
        # Scrollbar para la tabla
        scrollbar_tabla = ttk.Scrollbar(frame_tabla, orient=tk.VERTICAL, command=tree.yview)
        tree.configure(yscrollcommand=scrollbar_tabla.set)
        
        tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_tabla.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Guardar referencias
        setattr(self, f'tree_{nombre_super}', tree)
        setattr(self, f'entry_producto_{nombre_super}', entry_producto)
        setattr(self, f'entry_cantidad_{nombre_super}', entry_cantidad)
        setattr(self, f'entry_precio_{nombre_super}', entry_precio)
        
        # Label para total
        frame_total = tk.Frame(frame_seccion, bg='#f4f4f4')
        frame_total.pack(pady=5)
        
        tk.Label(frame_total, text=f"Total General {titulo.split()[-1]}:", 
                font=('Arial', 12, 'bold'), bg='#f4f4f4').pack(side=tk.LEFT)
        
        label_total = tk.Label(frame_total, text="0.00", 
                              font=('Arial', 12, 'bold'), bg='#f4f4f4', fg='#007bff')
        label_total.pack(side=tk.LEFT, padx=10)
        
        setattr(self, f'label_total_{nombre_super}', label_total)
        
        # Botones
        frame_botones = tk.Frame(frame_seccion, bg='#f4f4f4')
        frame_botones.pack(pady=5)
        
        btn_fila_vacia = tk.Button(frame_botones, text="Agregar Fila Vacía", 
                                  bg='#6c757d', fg='white',
                                  command=lambda: self.agregar_fila_vacia(nombre_super))
        btn_fila_vacia.pack(side=tk.LEFT, padx=5)
        
        btn_imprimir = tk.Button(frame_botones, text=f"Imprimir {titulo.split()[-1]}", 
                                bg='#17a2b8', fg='white',
                                command=lambda: self.imprimir_supermercado(nombre_super, titulo))
        btn_imprimir.pack(side=tk.LEFT, padx=5)
        
        btn_eliminar = tk.Button(frame_botones, text="Eliminar Seleccionado", 
                                bg='#dc3545', fg='white',
                                command=lambda: self.eliminar_producto(nombre_super))
        btn_eliminar.pack(side=tk.LEFT, padx=5)
        
        # Botón guardar como nuevo archivo
        btn_guardar_nuevo = tk.Button(frame_botones, text="💾 Guardar Como Nuevo", 
                                     bg='#fd7e14', fg='white',
                                     command=self.guardar_como_nuevo_archivo)
        btn_guardar_nuevo.pack(side=tk.LEFT, padx=5)
        
        # IMPORTANTE: Almacenar la referencia del frame en widgets_supermercados
        self.widgets_supermercados[nombre_super] = {
            'frame': frame_seccion,
            'tree': tree,
            'entry_producto': entry_producto,
            'entry_cantidad': entry_cantidad,
            'entry_precio': entry_precio,
            'label_total': label_total
        }
        
    def crear_resumen_total(self, parent):
        # Frame para resumen
        frame_resumen = tk.Frame(parent, bg='#f4f4f4', relief=tk.RAISED, bd=2)
        frame_resumen.pack(fill=tk.X, pady=20, padx=10)
        
        # Título
        titulo_resumen = tk.Label(frame_resumen, text="Resumen Total", 
                                 font=('Arial', 16, 'bold'), bg='#f4f4f4', fg='#333')
        titulo_resumen.pack(pady=10)
        
        # Tabla resumen
        frame_tabla_resumen = tk.Frame(frame_resumen, bg='#f4f4f4')
        frame_tabla_resumen.pack()
        
        columns_resumen = ('Supermercado', 'Total')
        self.tree_resumen = ttk.Treeview(frame_tabla_resumen, columns=columns_resumen, 
                                        show='headings', height=6)
        
        for col in columns_resumen:
            self.tree_resumen.heading(col, text=col)
            self.tree_resumen.column(col, width=200, anchor='center')
        
        self.tree_resumen.pack()
        
        # Insertar filas dinámicamente
        self.actualizar_resumen_supermercados()
        
        # Configurar estilos
        self.tree_resumen.tag_configure('total', background='#e9ecef', font=('Arial', 10, 'bold'))
        
        # Frame para botones del resumen
        frame_botones_resumen = tk.Frame(frame_resumen, bg='#f4f4f4')
        frame_botones_resumen.pack(pady=15)
        
        # Botón Guardar
        btn_guardar = tk.Button(frame_botones_resumen, text="💾 Guardar Datos", 
                               font=('Arial', 12, 'bold'), bg='#28a745', fg='white',
                               relief=tk.RAISED, bd=2, padx=20, pady=8,
                               command=self.guardar_datos_con_mensaje)
        btn_guardar.pack(side=tk.LEFT, padx=10)
        
        # Botón Imprimir Reporte
        btn_imprimir = tk.Button(frame_botones_resumen, text="🖨️ Imprimir Reporte", 
                                font=('Arial', 12, 'bold'), bg='#17a2b8', fg='white',
                                relief=tk.RAISED, bd=2, padx=20, pady=8,
                                command=self.imprimir_todas_compras)
        btn_imprimir.pack(side=tk.LEFT, padx=10)
    
    def actualizar_resumen_supermercados(self):
        """Actualiza el resumen con los supermercados actuales"""
        # Limpiar resumen actual
        for item in self.tree_resumen.get_children():
            self.tree_resumen.delete(item)
        
        # Insertar supermercados dinámicamente
        for super_id in self.supermercados:
            nombre_mostrar = super_id.replace("_", " ").title()
            self.tree_resumen.insert('', 'end', values=(nombre_mostrar, '0.00'), tags=('normal',))
        
        # Insertar total final
        self.tree_resumen.insert('', 'end', values=('TOTAL FINAL', '0.00'), tags=('total',))
        
    def guardar_datos_con_mensaje(self):
        """Guarda los datos y muestra mensaje de confirmación"""
        if self.guardar_datos():
            messagebox.showinfo("Éxito", f"Datos del mes '{self.mes_actual}' guardados correctamente.")
    
    def crear_nuevo_mes_desde_interfaz(self):
        """Crea un nuevo mes desde la interfaz principal"""
        respuesta = messagebox.askyesno(
            "Nuevo Mes",
            "¿Estás seguro de que quieres crear un nuevo mes?\n\n" +
            "Se perderán los datos no guardados del mes actual."
        )
        
        if respuesta:
            # Limpiar completamente todos los datos
            self.datos = {}
            
            # Limpiar lista de supermercados
            self.supermercados = []
            
            # Limpiar widgets de supermercados
            for widget_info in self.widgets_supermercados.values():
                if 'frame' in widget_info:
                    widget_info['frame'].destroy()
            self.widgets_supermercados.clear()
            
            # Eliminar todos los atributos dinámicos de trees y widgets
            attrs_to_remove = []
            for attr_name in dir(self):
                if (attr_name.startswith('tree_') or 
                    attr_name.startswith('entry_producto_') or 
                    attr_name.startswith('entry_cantidad_') or 
                    attr_name.startswith('entry_precio_') or 
                    attr_name.startswith('label_total_')):
                    attrs_to_remove.append(attr_name)
            
            for attr in attrs_to_remove:
                if hasattr(self, attr):
                    delattr(self, attr)
            
            # Limpiar el resumen si existe
            if hasattr(self, 'tree_resumen'):
                for item in self.tree_resumen.get_children():
                    self.tree_resumen.delete(item)
            
            # Actualizar la lista visual de supermercados
            self.actualizar_lista_supermercados()
            
            # Crear nuevo mes
            resultado = self.crear_nuevo_mes()
            
            if resultado:
                # Actualizar título con el nuevo mes
                self.actualizar_titulo()
                messagebox.showinfo("Éxito", f"Nuevo mes '{self.mes_actual}' creado correctamente.\n\nPuedes empezar a agregar supermercados.")
            else:
                # Si el usuario canceló la creación del nuevo mes, restaurar estado anterior
                messagebox.showinfo("Cancelado", "Operación cancelada. Los datos anteriores se mantienen.")
                # Aquí podrías implementar lógica para restaurar el estado anterior si es necesario
    
    def agregar_producto(self, supermercado, entry_producto, entry_cantidad, entry_precio):
        try:
            nombre = entry_producto.get().strip()
            cantidad = int(entry_cantidad.get())
            precio = float(entry_precio.get())
            
            if not nombre or cantidad <= 0 or precio < 0:
                messagebox.showerror("Error", "Por favor, ingresa datos válidos.")
                return
            
            # Buscar si el producto ya existe
            tree = getattr(self, f'tree_{supermercado}')
            producto_existente = None
            item_existente = None
            
            for item in tree.get_children():
                valores = tree.item(item)['values']
                # Asegurar que valores[0] sea string
                nombre_producto = str(valores[0]) if valores else ""
                if nombre_producto.lower() == nombre.lower():
                    producto_existente = valores
                    item_existente = item
                    break
            
            if producto_existente:
                # Producto duplicado encontrado - mostrar opciones
                respuesta = self._manejar_producto_duplicado(nombre, cantidad, precio, producto_existente)
                
                if respuesta == "sumar":
                    # Sumar cantidades
                    nueva_cantidad = int(float(str(producto_existente[1]))) + cantidad
                    tree.item(item_existente, values=(nombre, str(nueva_cantidad), f"{precio:.2f}", "0.00", "0.00"))
                elif respuesta == "reemplazar":
                    # Reemplazar producto existente
                    tree.item(item_existente, values=(nombre, str(cantidad), f"{precio:.2f}", "0.00", "0.00"))
                elif respuesta == "nuevo":
                    # Agregar como producto nuevo con nombre modificado
                    contador = 1
                    nombre_nuevo = f"{nombre} ({contador})"
                    while any(tree.item(item)['values'][0].lower() == nombre_nuevo.lower() for item in tree.get_children()):
                        contador += 1
                        nombre_nuevo = f"{nombre} ({contador})"
                    tree.insert('', 'end', values=(nombre_nuevo, str(cantidad), f"{precio:.2f}", "0.00", "0.00"))
                elif respuesta == "cancelar":
                    return  # No hacer nada
            else:
                # Producto nuevo - agregar normalmente
                tree.insert('', 'end', values=(nombre, str(cantidad), f"{precio:.2f}", "0.00", "0.00"))
            
            # Recalcular totales
            self.recalcular_totales(supermercado)
            
            # Limpiar campos
            entry_producto.delete(0, tk.END)
            entry_cantidad.delete(0, tk.END)
            entry_precio.delete(0, tk.END)
            entry_producto.focus()
            
            # Guardar automáticamente
            self.guardar_datos()
            
        except ValueError:
            messagebox.showerror("Error", "Por favor, ingresa valores numéricos válidos.")
    
    def _manejar_producto_duplicado(self, nombre, cantidad_nueva, precio_nuevo, producto_existente):
        """Maneja productos duplicados con opciones para el usuario"""
        # Crear ventana de opciones
        ventana_duplicado = tk.Toplevel(self.root)
        ventana_duplicado.title("⚠️ Producto Duplicado")
        ventana_duplicado.geometry("500x450")
        ventana_duplicado.configure(bg='#f8f9fa')
        ventana_duplicado.transient(self.root)
        ventana_duplicado.grab_set()
        
        # Centrar ventana
        ventana_duplicado.update_idletasks()
        x = (ventana_duplicado.winfo_screenwidth() // 2) - (500 // 2)
        y = (ventana_duplicado.winfo_screenheight() // 2) - (450 // 2)
        ventana_duplicado.geometry(f"500x450+{x}+{y}")
        
        # Variable para almacenar la respuesta
        respuesta = {'accion': 'cancelar'}
        
        # Título
        titulo = tk.Label(ventana_duplicado, text="⚠️ Producto Duplicado Detectado", 
                         font=('Arial', 16, 'bold'), bg='#f8f9fa', fg='#e67e22')
        titulo.pack(pady=20)
        
        # Información del conflicto
        info_frame = tk.Frame(ventana_duplicado, bg='#fff3cd', relief=tk.RAISED, bd=1)
        info_frame.pack(fill='x', padx=30, pady=15)
        
        tk.Label(info_frame, text=f"El producto '{nombre}' ya existe:", 
                font=('Arial', 12, 'bold'), bg='#fff3cd', fg='#856404').pack(pady=8)
        
        # Comparación
        comparacion_frame = tk.Frame(info_frame, bg='#fff3cd')
        comparacion_frame.pack(pady=10)
        
        # Producto existente
        tk.Label(comparacion_frame, text="Producto Existente:", 
                font=('Arial', 10, 'bold'), bg='#fff3cd').grid(row=0, column=0, sticky='w', padx=10)
        tk.Label(comparacion_frame, text=f"Cantidad: {producto_existente[1]}", 
                font=('Arial', 10), bg='#fff3cd').grid(row=1, column=0, sticky='w', padx=20)
        tk.Label(comparacion_frame, text=f"Precio: ${producto_existente[2]}", 
                font=('Arial', 10), bg='#fff3cd').grid(row=2, column=0, sticky='w', padx=20)
        
        # Producto nuevo
        tk.Label(comparacion_frame, text="Producto Nuevo:", 
                font=('Arial', 10, 'bold'), bg='#fff3cd').grid(row=0, column=1, sticky='w', padx=10)
        tk.Label(comparacion_frame, text=f"Cantidad: {cantidad_nueva}", 
                font=('Arial', 10), bg='#fff3cd').grid(row=1, column=1, sticky='w', padx=20)
        tk.Label(comparacion_frame, text=f"Precio: ${precio_nuevo:.2f}", 
                font=('Arial', 10), bg='#fff3cd').grid(row=2, column=1, sticky='w', padx=20)
        
        # Opciones
        opciones_frame = tk.Frame(ventana_duplicado, bg='#f8f9fa')
        opciones_frame.pack(fill='both', expand=True, padx=30, pady=20)
        
        tk.Label(opciones_frame, text="¿Qué deseas hacer?", 
                font=('Arial', 12, 'bold'), bg='#f8f9fa').pack(pady=(0, 15))
        
        def seleccionar_accion(accion):
            respuesta['accion'] = accion
            ventana_duplicado.destroy()
        
        # Botones de opciones
        btn_sumar = tk.Button(opciones_frame, text="➕ Sumar Cantidades", 
                             font=('Arial', 11), bg='#3498db', fg='white',
                             relief=tk.RAISED, bd=2, pady=8,
                             command=lambda: seleccionar_accion('sumar'))
        btn_sumar.pack(fill='x', pady=5)
        
        cantidad_total = int(producto_existente[1]) + cantidad_nueva
        tk.Label(opciones_frame, text=f"Resultado: {cantidad_total} unidades", 
                font=('Arial', 9), bg='#f8f9fa', fg='#7f8c8d').pack()
        
        btn_reemplazar = tk.Button(opciones_frame, text="🔄 Reemplazar Existente", 
                                  font=('Arial', 11), bg='#f39c12', fg='white',
                                  relief=tk.RAISED, bd=2, pady=8,
                                  command=lambda: seleccionar_accion('reemplazar'))
        btn_reemplazar.pack(fill='x', pady=(15, 5))
        
        tk.Label(opciones_frame, text="Se mantendrá solo el producto nuevo", 
                font=('Arial', 9), bg='#f8f9fa', fg='#7f8c8d').pack()
        
        btn_nuevo = tk.Button(opciones_frame, text="📝 Agregar Como Nuevo", 
                             font=('Arial', 11), bg='#27ae60', fg='white',
                             relief=tk.RAISED, bd=2, pady=8,
                             command=lambda: seleccionar_accion('nuevo'))
        btn_nuevo.pack(fill='x', pady=(15, 5))
        
        tk.Label(opciones_frame, text="Se agregará con nombre modificado", 
                font=('Arial', 9), bg='#f8f9fa', fg='#7f8c8d').pack()
        
        btn_cancelar = tk.Button(opciones_frame, text="❌ Cancelar", 
                                font=('Arial', 11), bg='#e74c3c', fg='white',
                                relief=tk.RAISED, bd=2, pady=8,
                                command=lambda: seleccionar_accion('cancelar'))
        btn_cancelar.pack(fill='x', pady=(15, 0))
        
        # Manejar cierre de ventana
        ventana_duplicado.protocol("WM_DELETE_WINDOW", lambda: seleccionar_accion('cancelar'))
        
        # Esperar respuesta
        ventana_duplicado.wait_window()
        
        return respuesta['accion']
    
    def agregar_fila_vacia(self, supermercado):
        tree = getattr(self, f'tree_{supermercado}')
        tree.insert('', 'end', values=("[Editar]", "1", "0.00", "0.00", "0.00"))
    
    def recalcular_totales(self, supermercado):
        tree = getattr(self, f'tree_{supermercado}')
        label_total = getattr(self, f'label_total_{supermercado}')
        
        total_general = 0
        total_acumulado = 0
        
        # Recalcular cada fila
        for item in tree.get_children():
            valores = tree.item(item)['values']
            try:
                cantidad = int(valores[1])
                precio = float(valores[2])
                monto_total = cantidad * precio
                total_acumulado += monto_total
                total_general += monto_total
                
                # Actualizar la fila
                tree.item(item, values=(valores[0], cantidad, f"{precio:.2f}", 
                                      f"{monto_total:.2f}", f"{total_acumulado:.2f}"))
            except (ValueError, IndexError):
                continue
        
        # Actualizar total general
        label_total.config(text=f"{total_general:.2f}")
        
        # Actualizar resumen
        self.recalcular_resumen()
    
    def recalcular_resumen(self):
        # Obtener totales de cada supermercado dinámicamente
        items = self.tree_resumen.get_children()
        total_final = 0
        
        # Actualizar cada supermercado en el resumen
        for i, super_id in enumerate(self.supermercados):
            if i < len(items) - 1:  # Excluir el último item que es el total final
                try:
                    label_total = getattr(self, f'label_total_{super_id}')
                    total_super = float(label_total.cget("text"))
                    nombre_mostrar = super_id.replace("_", " ").title()
                    self.tree_resumen.item(items[i], values=(nombre_mostrar, f"{total_super:.2f}"))
                    total_final += total_super
                except AttributeError:
                    # Si no existe el label, poner 0
                    nombre_mostrar = super_id.replace("_", " ").title()
                    self.tree_resumen.item(items[i], values=(nombre_mostrar, "0.00"))
        
        # Actualizar total final (último item)
        if items:
            self.tree_resumen.item(items[-1], values=('TOTAL FINAL', f"{total_final:.2f}"))
    
    def imprimir_supermercado(self, supermercado, titulo):
        """Imprime los datos de un supermercado específico en PDF"""
        tree = getattr(self, f'tree_{supermercado}')
        label_total = getattr(self, f'label_total_{supermercado}')
        
        # Crear carpeta de reportes si no existe
        reportes_dir = Path("reportes")
        reportes_dir.mkdir(exist_ok=True)
        
        # Nombre del archivo PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"reporte_{supermercado}_{timestamp}.pdf"
        ruta_archivo = reportes_dir / nombre_archivo
        
        # Crear el PDF
        self.crear_pdf_supermercado(str(ruta_archivo), supermercado, titulo, tree, label_total)
    
    def imprimir_todas_compras(self):
        """Imprime un reporte completo de todas las compras en PDF"""
        # Crear carpeta de reportes si no existe
        reportes_dir = Path("reportes")
        reportes_dir.mkdir(exist_ok=True)
        
        # Nombre del archivo PDF
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        nombre_archivo = f"reporte_completo_{timestamp}.pdf"
        ruta_archivo = reportes_dir / nombre_archivo
        
        # Crear el PDF completo
        self.crear_pdf_completo(str(ruta_archivo))
    
    def crear_pdf_supermercado(self, ruta_archivo, supermercado, titulo, tree, label_total):
        """Crea un PDF para un supermercado específico"""
        try:
            doc = SimpleDocTemplate(ruta_archivo, pagesize=A4, 
                                  rightMargin=72, leftMargin=72, 
                                  topMargin=72, bottomMargin=18)
            
            # Estilos
            styles = getSampleStyleSheet()
            
            # Estilo personalizado para el título principal
            titulo_principal = ParagraphStyle(
                'TituloPrincipal',
                parent=styles['Heading1'],
                fontSize=24,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue,
                fontName='Helvetica-Bold'
            )
            
            # Estilo para subtítulos
            subtitulo_style = ParagraphStyle(
                'Subtitulo',
                parent=styles['Heading2'],
                fontSize=16,
                spaceAfter=20,
                alignment=TA_CENTER,
                textColor=colors.darkgreen,
                fontName='Helvetica-Bold'
            )
            
            # Estilo para información
            info_style = ParagraphStyle(
                'Info',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=10,
                alignment=TA_CENTER,
                textColor=colors.black
            )
            
            # Contenido del PDF
            story = []
            
            # Título principal
            story.append(Paragraph("🛒 CONTROL DE GASTOS", titulo_principal))
            story.append(Spacer(1, 20))
            
            # Subtítulo del supermercado
            story.append(Paragraph(f"Reporte de {titulo.upper()}", subtitulo_style))
            story.append(Spacer(1, 10))
            
            # Información de fecha y mes
            fecha_actual = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
            mes_actual = self.mes_actual or "Mes no especificado"
            story.append(Paragraph(f"Fecha de generación: {fecha_actual}", info_style))
            story.append(Paragraph(f"Período: {mes_actual}", info_style))
            story.append(Spacer(1, 30))
            
            # Crear tabla de productos
            data = [['Producto', 'Cantidad', 'Precio Unitario', 'Total', 'Acumulado']]
            
            total_items = 0
            for item in tree.get_children():
                valores = tree.item(item)['values']
                if len(valores) >= 5:
                    data.append([
                        str(valores[0]),
                        str(valores[1]),
                        f"${valores[2]}",
                        f"${valores[3]}",
                        f"${valores[4]}"
                    ])
                    total_items += 1
            
            # Crear la tabla
            tabla = Table(data, colWidths=[2.5*inch, 0.8*inch, 1.2*inch, 1.2*inch, 1.2*inch])
            
            # Estilo de la tabla
            tabla.setStyle(TableStyle([
                # Encabezado
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                
                # Contenido
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                
                # Bordes
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('LINEBELOW', (0, 0), (-1, 0), 2, colors.darkblue),
                
                # Alternar colores de filas
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
            ]))
            
            story.append(tabla)
            story.append(Spacer(1, 30))
            
            # Resumen
            total_super = label_total.cget('text')
            resumen_data = [
                ['Total de productos:', str(total_items)],
                ['TOTAL GENERAL:', f"${total_super}"]
            ]
            
            resumen_tabla = Table(resumen_data, colWidths=[3*inch, 2*inch])
            resumen_tabla.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.lightblue),
                ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 12),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('BACKGROUND', (0, 1), (-1, 1), colors.darkgreen),
                ('TEXTCOLOR', (0, 1), (-1, 1), colors.white),
            ]))
            
            story.append(resumen_tabla)
            
            # Generar el PDF
            doc.build(story)
            
            messagebox.showinfo("Reporte Generado", 
                              f"Reporte PDF generado exitosamente:\n{ruta_archivo}\n\n"
                              f"El archivo se ha guardado en la carpeta 'reportes'.")
            
            # Abrir el archivo automáticamente
            try:
                os.startfile(ruta_archivo)
            except:
                pass
                
        except Exception as e:
            messagebox.showerror("Error", f"Error al generar el reporte PDF:\n{str(e)}")
    
    def crear_pdf_completo(self, ruta_archivo):
        """Crea un PDF completo con todos los supermercados"""
        try:
            doc = SimpleDocTemplate(ruta_archivo, pagesize=A4,
                                  rightMargin=72, leftMargin=72,
                                  topMargin=72, bottomMargin=18)
            
            styles = getSampleStyleSheet()
            
            # Estilos personalizados
            titulo_principal = ParagraphStyle(
                'TituloPrincipal',
                parent=styles['Heading1'],
                fontSize=26,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue,
                fontName='Helvetica-Bold'
            )
            
            subtitulo_style = ParagraphStyle(
                'Subtitulo',
                parent=styles['Heading2'],
                fontSize=18,
                spaceAfter=20,
                alignment=TA_CENTER,
                textColor=colors.darkgreen,
                fontName='Helvetica-Bold'
            )
            
            supermercado_style = ParagraphStyle(
                'SupermercadoTitulo',
                parent=styles['Heading3'],
                fontSize=14,
                spaceAfter=15,
                alignment=TA_LEFT,
                textColor=colors.darkred,
                fontName='Helvetica-Bold'
            )
            
            info_style = ParagraphStyle(
                'Info',
                parent=styles['Normal'],
                fontSize=12,
                spaceAfter=10,
                alignment=TA_CENTER,
                textColor=colors.black
            )
            
            story = []
            
            # Título principal
            story.append(Paragraph("🛒 CONTROL DE GASTOS", titulo_principal))
            story.append(Spacer(1, 20))
            
            # Subtítulo
            story.append(Paragraph("REPORTE COMPLETO - TODOS LOS SUPERMERCADOS", subtitulo_style))
            story.append(Spacer(1, 10))
            
            # Información
            fecha_actual = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
            mes_actual = self.mes_actual or "Mes no especificado"
            story.append(Paragraph(f"Fecha de generación: {fecha_actual}", info_style))
            story.append(Paragraph(f"Período: {mes_actual}", info_style))
            story.append(Spacer(1, 30))
            
            total_general_todos = 0
            total_productos_todos = 0
            
            # Iterar sobre supermercados
            for i, super_id in enumerate(self.supermercados):
                try:
                    tree = getattr(self, f'tree_{super_id}')
                    label_total = getattr(self, f'label_total_{super_id}')
                    
                    titulo = super_id.replace("_", " ").title()
                    
                    # Título del supermercado
                    story.append(Paragraph(f"📍 SUPERMERCADO {titulo.upper()}", supermercado_style))
                    story.append(Spacer(1, 10))
                    
                    # Tabla de productos del supermercado
                    data = [['Producto', 'Cantidad', 'Precio Unitario', 'Total']]
                    
                    total_productos_super = 0
                    for item in tree.get_children():
                        valores = tree.item(item)['values']
                        if len(valores) >= 4:
                            data.append([
                                str(valores[0]),
                                str(valores[1]),
                                f"${valores[2]}",
                                f"${valores[3]}"
                            ])
                            total_productos_super += 1
                    
                    if len(data) > 1:  # Si hay productos
                        tabla = Table(data, colWidths=[3*inch, 0.8*inch, 1.3*inch, 1.3*inch])
                        tabla.setStyle(TableStyle([
                            ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
                            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                            ('FONTSIZE', (0, 0), (-1, 0), 11),
                            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
                            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                            ('FONTSIZE', (0, 1), (-1, -1), 9),
                            ('GRID', (0, 0), (-1, -1), 1, colors.black),
                            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                        ]))
                        
                        story.append(tabla)
                    else:
                        story.append(Paragraph("No hay productos registrados", info_style))
                    
                    # Subtotal del supermercado
                    total_super = float(label_total.cget('text'))
                    subtotal_data = [[
                        f"Subtotal {titulo}:",
                        f"${total_super:.2f} ({total_productos_super} productos)"
                    ]]
                    
                    subtotal_tabla = Table(subtotal_data, colWidths=[3*inch, 3*inch])
                    subtotal_tabla.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgreen),
                        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, -1), 11),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ]))
                    
                    story.append(Spacer(1, 10))
                    story.append(subtotal_tabla)
                    story.append(Spacer(1, 20))
                    
                    # Agregar salto de página si no es el último supermercado
                    if i < len(self.supermercados) - 1:
                        story.append(PageBreak())
                        
                except AttributeError:
                    continue
            
            # Resumen final mejorado
            story.append(Spacer(1, 30))
            story.append(Paragraph("📊 RESUMEN GENERAL", supermercado_style))
            story.append(Spacer(1, 15))
            
            # Crear tabla de resumen por supermercado
            resumen_data = [['Supermercado', 'Productos', 'Monto Total']]
            
            # Recopilar datos de cada supermercado para el resumen
            total_general_todos = 0
            total_productos_todos = 0
            
            for super_id in self.supermercados:
                try:
                    tree = getattr(self, f'tree_{super_id}')
                    label_total = getattr(self, f'label_total_{super_id}')
                    
                    titulo = super_id.replace("_", " ").title()
                    total_super = float(label_total.cget('text'))
                    
                    # Contar productos del supermercado
                    productos_super = len(tree.get_children())
                    
                    # Agregar fila al resumen
                    resumen_data.append([
                        titulo,
                        str(productos_super),
                        f"${total_super:.2f}"
                    ])
                    
                    total_general_todos += total_super
                    total_productos_todos += productos_super
                    
                except AttributeError:
                    continue
            
            # Agregar fila de totales
            resumen_data.append([
                'TOTAL GENERAL:',
                str(total_productos_todos),
                f"${total_general_todos:.2f}"
            ])
            
            # Crear tabla de resumen
            resumen_tabla = Table(resumen_data, colWidths=[2.5*inch, 1*inch, 1.5*inch])
            resumen_tabla.setStyle(TableStyle([
                # Encabezado
                ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                
                # Filas de supermercados
                ('BACKGROUND', (0, 1), (-1, -2), colors.lightblue),
                ('TEXTCOLOR', (0, 1), (-1, -2), colors.black),
                ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -2), 10),
                
                # Fila de total
                ('BACKGROUND', (0, -1), (-1, -1), colors.darkgreen),
                ('TEXTCOLOR', (0, -1), (-1, -1), colors.white),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
                ('FONTSIZE', (0, -1), (-1, -1), 12),
                
                # Alineación y bordes
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),  # Nombres de supermercados alineados a la izquierda
                ('GRID', (0, 0), (-1, -1), 2, colors.black),
                ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.lightgrey]),
            ]))
            
            story.append(resumen_tabla)
            
            # Agregar información adicional
            story.append(Spacer(1, 20))
            
            # Estadísticas adicionales
            if len(self.supermercados) > 1:
                promedio_por_super = total_general_todos / len(self.supermercados)
                story.append(Paragraph(f"💡 Promedio por supermercado: ${promedio_por_super:.2f}", info_style))
            
            story.append(Paragraph(f"📅 Total de supermercados registrados: {len(self.supermercados)}", info_style))
            
            # Generar el PDF
            doc.build(story)
            
            messagebox.showinfo("Reporte Generado", 
                              f"Reporte PDF completo generado exitosamente:\n{ruta_archivo}\n\n"
                              f"El archivo se ha guardado en la carpeta 'reportes'.")
            
            # Abrir el archivo automáticamente
            try:
                os.startfile(ruta_archivo)
            except:
                pass
                
        except Exception as e:
            messagebox.showerror("Error", f"Error al generar el reporte PDF completo:\n{str(e)}")
    
    def guardar_reporte(self, contenido, nombre_archivo):
        """Guarda el reporte en un archivo de texto"""
        try:
            ruta_archivo = os.path.join(os.getcwd(), nombre_archivo)
            with open(ruta_archivo, 'w', encoding='utf-8') as archivo:
                for linea in contenido:
                    archivo.write(linea + '\n')
            
            messagebox.showinfo("Reporte Generado", 
                              f"Reporte guardado exitosamente:\n{ruta_archivo}\n\n"
                              f"Puedes abrir el archivo para imprimirlo o enviarlo por email.")
            
            # Abrir el archivo automáticamente
            try:
                os.startfile(ruta_archivo)
            except:
                pass  # Si no puede abrir, no pasa nada
                
        except Exception as e:
            messagebox.showerror("Error", f"Error al guardar el reporte:\n{str(e)}")
    
    def editar_producto(self, supermercado, tree):
        """Permite editar un producto seleccionado"""
        selection = tree.selection()
        if not selection:
            messagebox.showwarning("Advertencia", "Por favor, selecciona un producto para editar.")
            return
        
        item = selection[0]
        valores = tree.item(item)['values']
        
        if len(valores) < 3:
            return
        
        # Crear ventana de edición
        ventana_edicion = tk.Toplevel(self.root)
        ventana_edicion.title("Editar Producto")
        ventana_edicion.geometry("400x300")
        ventana_edicion.configure(bg='#f4f4f4')
        ventana_edicion.transient(self.root)
        ventana_edicion.grab_set()
        
        # Centrar ventana
        ventana_edicion.geometry("+%d+%d" % (self.root.winfo_rootx() + 50, self.root.winfo_rooty() + 50))
        
        # Título
        tk.Label(ventana_edicion, text="Editar Producto", 
                font=('Arial', 14, 'bold'), bg='#f4f4f4').pack(pady=10)
        
        # Frame para campos
        frame_campos = tk.Frame(ventana_edicion, bg='#f4f4f4')
        frame_campos.pack(pady=20, padx=20, fill=tk.X)
        
        # Campos de edición
        tk.Label(frame_campos, text="Nombre del producto:", bg='#f4f4f4').grid(row=0, column=0, sticky='w', pady=5)
        entry_nombre = tk.Entry(frame_campos, width=30)
        entry_nombre.grid(row=0, column=1, pady=5, padx=10)
        entry_nombre.insert(0, str(valores[0]))
        
        tk.Label(frame_campos, text="Cantidad:", bg='#f4f4f4').grid(row=1, column=0, sticky='w', pady=5)
        entry_cantidad = tk.Entry(frame_campos, width=30)
        entry_cantidad.grid(row=1, column=1, pady=5, padx=10)
        entry_cantidad.insert(0, str(valores[1]))
        
        tk.Label(frame_campos, text="Precio unitario:", bg='#f4f4f4').grid(row=2, column=0, sticky='w', pady=5)
        entry_precio = tk.Entry(frame_campos, width=30)
        entry_precio.grid(row=2, column=1, pady=5, padx=10)
        entry_precio.insert(0, str(valores[2]))
        
        # Frame para botones
        frame_botones_edicion = tk.Frame(ventana_edicion, bg='#f4f4f4')
        frame_botones_edicion.pack(pady=20)
        
        def guardar_cambios():
            try:
                nuevo_nombre = entry_nombre.get().strip()
                nueva_cantidad = int(entry_cantidad.get())
                nuevo_precio = float(entry_precio.get())
                
                if not nuevo_nombre or nueva_cantidad <= 0 or nuevo_precio < 0:
                    messagebox.showerror("Error", "Por favor, ingresa datos válidos.")
                    return
                
                # Actualizar el item
                tree.item(item, values=(nuevo_nombre, nueva_cantidad, f"{nuevo_precio:.2f}", "0.00", "0.00"))
                
                # Recalcular totales
                self.recalcular_totales(supermercado)
                
                # Guardar automáticamente
                self.guardar_datos()
                
                ventana_edicion.destroy()
                messagebox.showinfo("Éxito", "Producto actualizado correctamente.")
                
            except ValueError:
                messagebox.showerror("Error", "Por favor, ingresa valores numéricos válidos.")
        
        def cancelar():
            ventana_edicion.destroy()
        
        # Botones
        btn_guardar = tk.Button(frame_botones_edicion, text="Guardar Cambios", 
                               bg='#28a745', fg='white', command=guardar_cambios)
        btn_guardar.pack(side=tk.LEFT, padx=10)
        
        btn_cancelar = tk.Button(frame_botones_edicion, text="Cancelar", 
                                bg='#6c757d', fg='white', command=cancelar)
        btn_cancelar.pack(side=tk.LEFT, padx=10)
        
        # Instrucciones
        instrucciones = tk.Label(ventana_edicion, 
                               text="Haz doble clic en cualquier producto de la tabla para editarlo",
                               bg='#f4f4f4', fg='#666', font=('Arial', 9))
        instrucciones.pack(pady=10)
        
        # Focus en el primer campo
        entry_nombre.focus()
        entry_nombre.select_range(0, tk.END)
    
    def eliminar_producto(self, supermercado):
        """Elimina el producto seleccionado"""
        try:
            tree = getattr(self, f'tree_{supermercado}')
            selection = tree.selection()
            
            if not selection:
                messagebox.showwarning("Advertencia", "Por favor, selecciona un producto para eliminar.")
                return
            
            # Confirmar eliminación
            item = selection[0]
            valores = tree.item(item)['values']
            
            # Verificar que hay valores válidos
            if not valores or len(valores) == 0:
                messagebox.showerror("Error", "No se pueden obtener los datos del producto seleccionado.")
                return
                
            producto_nombre = str(valores[0]) if valores else "producto"
            
            respuesta = messagebox.askyesno("Confirmar Eliminación", 
                                           f"¿Estás seguro de que quieres eliminar '{producto_nombre}'?")
            
            if respuesta:
                # Eliminar el item del tree
                tree.delete(item)
                
                # Recalcular totales
                self.recalcular_totales(supermercado)
                
                # Guardar automáticamente
                resultado_guardado = self.guardar_datos()
                
                if resultado_guardado is not False:
                    messagebox.showinfo("Éxito", f"Producto '{producto_nombre}' eliminado correctamente.")
                else:
                    messagebox.showwarning("Advertencia", f"Producto eliminado pero hubo un problema al guardar los datos.")
                    
        except AttributeError as e:
            messagebox.showerror("Error", f"Error al acceder al supermercado '{supermercado}': {str(e)}")
        except Exception as e:
            messagebox.showerror("Error", f"Error inesperado al eliminar producto: {str(e)}")

def main():
    print("DEBUG: Iniciando función main")
    root = tk.Tk()
    print("DEBUG: Ventana root creada")
    app = ControlGastos(root)
    print("DEBUG: ControlGastos inicializado, iniciando mainloop")
    root.mainloop()
    print("DEBUG: mainloop terminado")

if __name__ == "__main__":
    print("DEBUG: Ejecutando script principal")
    main()