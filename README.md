# SmartTaller 🪵🤖

> **Sistema Experto de Planificación y Cotización Automatizada para Mobiliario a Medida**
> Proyecto Final para el sector secundario enfocado en la transformación digital de carpinterías familiares.

---

## 👥 Integrantes del Proyecto
Este proyecto fue desarrollado en colaboración por:
*   **Juan Pablo Ramirez** - @JuanRamirez1234112
*   **Andrea Paulovi Bermudez** - @AndreaPaulovi
*   **Maria de los Angeles García Giraldo** - @MariGiraldo

---

## 📝 Resumen del Proyecto

SmartTaller es una aplicación web inteligente diseñada para digitalizar, optimizar y automatizar los procesos de un taller de carpintería tradicional enfocado exclusivamente en tres productos a medida: **Mesas, Sillas y Escritorios**. 

La plataforma resuelve el problema de la cotización empírica ("al ojo") y los cuellos de botella en la producción, transformando requerimientos personalizados en presupuestos exactos y planes de trabajo cronometrados en tiempo real.

---

## ⚙️ ¿Cómo Funciona?

El funcionamiento de la aplicación se divide en tres etapas clave:

1. **Captura de Requerimientos (Input):** El administrador ingresa los datos específicos del pedido del cliente: tipo de mueble (Mesa/Silla/Escritorio), dimensiones exactas (Alto, Ancho, Largo), tipo de madera (Pino, Cedro, Roble) y aditamentos (ej. número de cajones para escritorios).
2. **Procesamiento Inteligente (Sistema Experto + Automated Planning):** El backend procesa las variables mediante reglas lógicas del negocio de la madera:
   * **Cálculo Volumétrico:** Determina el material necesario y calcula automáticamente la merma (desperdicio por corte).
   * **Algoritmo de Costos:** Cruza los insumos con los precios base de la BD para asegurar un margen de ganancia neto del 35%.
   * **Planificación de Tareas:** Genera una hoja de ruta de producción (Corte ➡️ Ensamble ➡️ Lijado ➡️ Acabado) ajustando los tiempos según la densidad de la madera elegida.
3. **Visualización y Control (Output):** Genera una cotización formal en PDF para el cliente e inserta el nuevo pedido en el **Dashboard de Gestión** del carpintero, actualizando su calendario de tareas diarias.

---

## 🛠️ Enfoque Tecnológico y Arquitectura de Datos

Para cumplir con los requerimientos académicos, el proyecto se basa en dos pilares:

*   **Modelado de Bases de Datos e Inteligencia de Negocios (BI):** Estructura relacional que almacena las "recetas base" de los muebles, costos de materiales por pulgada y tiempos de mano de obra para alimentar gráficos analíticos de rentabilidad.
*   **Inteligencia Artificial (Sistema Experto y Automated Planning):** Un motor de inferencia lógica que automatiza la toma de decisiones financieras y logísticas operando bajo reglas de restricciones físicas y operacionales del taller.

---

## 📊 Indicadores de Impacto (KPIs)

El éxito y funcionamiento de la solución se mide mediante:
*   **Tiempo de Respuesta al Cliente:** Reducción del tiempo de cotización de 24 horas a menos de 5 minutos.
*   **Precisión Financiera:** Desviación menor al 5% entre el costo estimado por el sistema y el costo real de producción.
*   **Eficiencia Operativa:** Tasa de cumplimiento de la agenda de manufactura sugerida por el planificador de la app.
