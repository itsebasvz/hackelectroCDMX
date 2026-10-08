# Catálogo Extendido de Vehículos: Eléctricos vs. Combustión

**Expediente de investigación técnica · Reto 2: «Electrifica tu flota»**  
Fecha de consolidación: Octubre de 2026.  
Ubicación del dataset tabular: [`catalogo-vehiculos-electricos-combustion.csv`](catalogo-vehiculos-electricos-combustion.csv).  
Fuentes citadas y fichas técnicas: [Fichas técnicas y catálogo](../../contexto/fichas-tecnicas-vehiculos.md).

---

## 1. Justificación y Metodología de Equivalencia

En la Ciudad de México, el transporte público concesionado de ruta (como la **Ruta 1: Metro CU – San Fernando – Huipulco**) opera históricamente con una heterogeneidad de tecnologías de combustión interna:
1. **Vanes y Combis de baja capacidad (11 a 17 plazas):** Predominantemente motorizaciones a gasolina de 2.4L a 3.5L (Nissan NV350 Urvan, Toyota Hiace, Ford Transit) y versiones diésel.
2. **Minibuses y Midibuses (25 a 35 plazas, 7 a 9 metros):** Los tradicionales «microbuses» sobre chasis coraza (Chevrolet/Isuzu) y unidades tipo Boxer (Mercedes-Benz) o DINA Runner con motores diésel de 4 a 6 cilindros (Cummins ISF 3.8L, Mercedes OM904/OM924LA).
3. **Autobuses Urbanos de 12 metros (80 a 90 plazas):** Unidades tipo padrón utilizadas en corredores viales, Metrobus y RTP (DINA Linner, Mercedes-Benz O500U, Volvo 7900) a diésel o Gas Natural Comprimido (GNC).

Para que la evaluación de una transición eléctrica sea rigurosa, no se puede comparar un vehículo eléctrico genérico contra un promedio abstracto: **se debe contrastar cada modelo 100% eléctrico (BEV) contra su contraparte directa en la misma plataforma o contra el vehículo de combustión homologado que hoy realiza ese servicio en CDMX**.

> [!NOTE]
> **Criterio metodológico sobre Vanes y Combis:**  
> La inclusión de combis (JAC E Sunray, Foton e-View, Hiace, Urvan, etc.) responde a que **existen ramales en CDMX cuya operación real ya se realiza mediante combi** (rutas capilares de ladera, colonias altas, calles estrechas con pendientes o baja densidad). Se evalúan para simular su transición tecnológica directa (**combi a gasolina/diésel ➔ combi eléctrica**) y medir su eficiencia energética, autonomía y costos operativos; **no se plantean como sustitutos de microbuses o autobuses**, ya que forzar una reducción de plazas en rutas de alta demanda saturaría el servicio y desequilibraría la nómina de operadores.

---

## 2. Resumen del Catálogo por Categorías

El catálogo recopila **33 modelos eléctricos** disponibles a nivel global, regional (Latinoamérica/México) y sus **equivalentes directos de combustión interna (gasolina, diésel y GNC)**:

| Categoría | Modelos EV Analizados | Rango Batería (kWh) | Autonomía Nominal (km) | Equivalentes ICE Principales | Consumo Promedio ICE |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Vanes y Combis** | 11 | 38.7 – 113.0 kWh | 200 – 400 km | Gasolina (2.0L–3.5L) / Diésel (2.0L–2.8L) | 7.8 – 14.5 km/L (6.9 – 12.8 L/100km) |
| **Midibuses (7–9m)** | 10 | 105.0 – 220.0 kWh | 150 – 300 km | Diésel (3.8L–5.2L) / GNC | 3.8 – 5.5 km/L (18.2 – 26.3 L/100km) |
| **Autobuses 12m** | 12 | 250.0 – 396.0 kWh | 200 – 320 km | Diésel (6.7L–9.3L) / GNC (8.9L) | 2.7 – 3.0 km/L (33.3 – 37.0 L/100km) |

---

## 3. Desglose Detallado por Categoría

### A. Vanes y Combis Eléctricas vs. Combustión

Las vanes eléctricas representan la opción más inmediata para ramales alimentadores y recorridos capilares estrechos de la periferia y zonas hospitalarias:

| ID | Modelo Eléctrico | Plazas | Batería / Química | Consumo EV (kWh/100km) | Modelo ICE Equivalente | Motor / Combustible | Consumo ICE (km/L) | Relevancia en CDMX |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **VAN-01** | JAC E Sunray | 17 | 77.3 kWh (LFP) | 27.0 | JAC Sunray 2.8T | 2.8L CTI Diésel (150 hp) | 9.5 | Sustitución directa de colectivos largos |
| **VAN-02** | Foton e-View CS2 | 16 | 50.2 kWh (LFP) | 22.0 | Foton View CS2 | 2.4L Gasolina / 2.8L Diésel | 9.0 | Plataforma tipo Toyota Hiace / Urvan |
| **VAN-03** | Maxus eDeliver 9 | 15 | 88.5 kWh (Li-ion) | 30.0 | Maxus Deliver 9 | 2.0L Turbo Diésel (150 hp) | 10.8 | Van ejecutiva y alimentadora de piso plano |
| **VAN-04** | Ford E-Transit | 15 | 89.0 kWh (Li-ion) | 31.0 | Ford Transit Pasajeros | 3.5L V6 Gasolina (275 hp) | 7.8 | Chasis común en flotas comerciales CDMX |
| **VAN-05** | Renault Master E-Tech | 15 | 52.0 kWh (Li-ion) | 26.0 | Renault Master Minibús | 2.3L dCi Diésel (136 hp) | 11.0 | Ideal para servicios interurbanos planos |
| **VAN-06** | MB eSprinter | 15 | 113.0 kWh (LFP) | 28.0 | MB Sprinter 315/415 | 2.0L OM654 Diésel (150 hp) | 10.2 | Máxima autonomía en vanes de ruta larga |
| **VAN-07** | Peugeot e-Traveller | 11 | 75.0 kWh (Li-ion) | 23.0 | Peugeot Traveller | 2.0L BlueHDi Diésel (150 hp) | 14.5 | Transporte adaptado / pacientes |
| **VAN-08** | Joylong E6 | 20 | 86.1 kWh (LFP) | 28.5 | Joylong A6 | 2.4L Gasolina / 2.8L Diésel | 8.5 | Capacidad extendida para alta afluencia |
| **VAN-09** | Jinbei Haise EV | 15 | 50.2 kWh (LFP) | 20.0 | Jinbei Haise H2 | 2.2L V19 Gasolina (106 hp) | 8.2 | Clon mecánico de Hiace clásica |
| **VAN-10** | Wuling EV50 | 11 | 43.2 kWh (LFP) | 17.0 | Wuling Rongguang | 1.5L Gasolina (99 hp) | 13.5 | Alimentadora de calles muy angostas |
| **VAN-11** | DFSK EC35 | 11 | 38.7 kWh (LFP) | 16.0 | DFSK C37 | 1.5L Gasolina (115 hp) | 12.8 | Circuito barrial corto de bajo costo |

---

### B. Midibuses (7 a 9 metros)

El midibús es la unidad clave para sustituir el parque vehicular de **microbuses concesionados** en CDMX sin saturar la vialidad ni requerir radios de giro de 12 metros:

| ID | Modelo Eléctrico | Plazas | Batería / Química | Consumo EV (kWh/100km) | Modelo ICE Equivalente | Motor / Combustible | Consumo ICE (km/L) | Relevancia en CDMX |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **MIDI-01** | Volare Access-E | 26 | 150 kWh (LFP) | 60.0 | Volare Fly 9 / W9 | Cummins ISF 3.8L Diésel | 4.5 | Piso bajo accesible; probado en Brasil |
| **MIDI-02** | BYD K7 / B8 | 26 | 174 kWh (LFP) | 69.0 | DINA Runner 9 / Boxer 8 | Cummins ISF 3.8L / OM924 | 4.3 | Reemplazo estándar de microbús Ruta 1 |
| **MIDI-03** | Yutong E8 | 28 | 115.9 kWh (LFP) | 46.0 | Yutong ZK6770 / ZK6800 | Cummins ISB4.5 / Yuchai | 4.8 | Gran maniobrabilidad; Metro Universidad |
| **MIDI-04** | Zhongtong 8m | 25 | 130 kWh (LFP) | 50.0 | Zhongtong LCK6809G | Cummins ISDe 4.5L Diésel | 4.5 | Flota zonal de media demanda |
| **MIDI-05** | Skywell NJGD | 25 | 140 kWh (LFP) | 56.0 | King Long XMQ6800 | Cummins B4.5 / Yuchai GNC | 4.4 | Rutas con pendientes intermedias |
| **MIDI-06** | King Long XMQ6850 | 26 | 160 kWh (LFP) | 61.0 | King Long XMQ6850G | Cummins B6.7G Gas / B4.5 | 4.0 | Corredores con meta de emisiones cero |
| **MIDI-07** | Hyundai County EV | 33 | 128 kWh (Li-ion) | 51.0 | Hyundai County Diésel | 3.9L D4GA CRDi (170 hp) | 5.2 | Alta proporción de asientos |
| **MIDI-08** | Hino Poncho Z EV | 30 | 105 kWh (Li-ion) | 70.0 | Hino Poncho Diésel | 5.1L J05E-TS Diésel | 5.5 | Piso bajo integral; acceso hospitalario |
| **MIDI-09** | Isuzu Novociti Volt | 52 | 211 kWh (LFP) | 70.0 | Isuzu Novociti Life | 4.5L FPT NEF4 Diésel (186 hp) | 3.8 | Capacidad extendida mixta (pie/asiento) |
| **MIDI-10** | Karsan e-ATAK | 52 | 220 kWh (BMW Li) | 73.0 | Karsan Atak Diésel | 4.5L FPT NEF4 Diésel (186 hp) | 3.8 | Tecnología de batería BMW i3 |

---

### C. Autobuses Urbanos de 12 Metros

Unidades de alta capacidad para corredores troncales, equivalentes a los servicios de RTP y líneas alimentadoras de Metrobús:

| ID | Modelo Eléctrico | Plazas | Batería / Química | Consumo EV (kWh/100km) | Modelo ICE Equivalente | Motor / Combustible | Consumo ICE (km/L) | Relevancia en CDMX |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: | :--- |
| **URB-01** | DINA Linner E | 85 | 314 kWh (LFP) | 125.0 | DINA Linner 12 Diésel/GNC | Cummins B6.7 / L9N GNC | 2.8 | Hecho en México; flota base RTP |
| **URB-02** | Yutong E12 | 85 | 352.1 kWh (LFP) | 110.0 | Yutong ZK6128HG | Cummins L8.9 / Yuchai | 2.7 | Misma marca de Trolebús CDMX |
| **URB-03** | BYD K9 | 85 | 324 kWh (LFP) | 129.0 | MB Torino O500U | Mercedes OM926LA Diésel | 2.8 | Probado en Metrobús L4 |
| **URB-04** | Volvo Luminus | 85 | 330 kWh (NMC) | 132.0 | Volvo 7900 / B8RLE | Volvo D8K Euro VI (280 hp) | 2.9 | Estándar Metrobús troncal |
| **URB-05** | Scania Citywide Volt| 85 | 330 kWh (NMC) | 132.0 | Scania K280UB Diésel/Gas | Scania DC09 / OC09 GNC | 2.8 | Chasis sueco de alta durabilidad |
| **URB-06** | MB eO500U | 85 | 384 kWh (NMC3) | 150.0 | MB O500U BlueTec 6 | Mercedes OM936 Euro VI | 2.8 | Plataforma líder en Brasil y CDMX |
| **URB-07** | Marcopolo Attivi | 85 | 396 kWh (LFP) | 140.0 | Marcopolo Torino Low Entry| Chasis MB O500U / Scania | 2.8 | Autobús urbano integral brasileño |
| **URB-08** | Irizar ie tram | 80 | 350 kWh (Li-ion) | 140.0 | Irizar i3 Low Entry Diésel| Cummins B6.7 Diésel | 2.9 | Diseño tipo tranvía (caso Va y Ven) |
| **URB-09** | Hyundai Elec City | 85 | 256 kWh (Polímero) | 88.0 | Hyundai Super Aero City | D6AB Diésel / C6AB GNC | 2.8 | Configuración urbana compacta (10.9m) |
| **URB-10** | Tata Starbus EV | 85 | 250 kWh (LFP) | 125.0 | Tata Starbus Urban | Cummins ISBe 5.9L / 6.7L | 3.0 | Servicio masivo de bajo costo |
| **URB-11** | Higer KLQ6125GEV | 85 | 300 kWh (LFP) | 120.0 | Higer KLQ6125G | Cummins ISL8.9 / Yuchai | 2.8 | Flota de enlace suburbano |
| **URB-12** | CRRC C12 | 85 | 315 kWh (LFP) | 121.0 | CRRC TEG6125 | Yuchai YC6L / Weichai WP7 | 2.8 | Padrón chino de gran volumen |

---

## 4. Hallazgos Comparativos Energéticos y Operativos

1. **Eficiencia Termodinámica vs. Consumo Específico:**
   * En vanes, un motor a gasolina gasta en promedio **11 a 13 L/100km** (~110–130 kWh equivalentes de energía primaria). La van eléctrica equivalente consume **17 a 31 kWh/100km**, lo que representa una **reducción de energía primaria de 3 a 4 veces**.
   * En midibuses, el diésel promedio consume **20 a 26 L/100km** (~200–260 kWh equivalentes). El midibús eléctrico consume **46 a 73 kWh/100km**.
   * En autobuses de 12 metros, el consumo diésel típico en tráfico de CDMX es de **34 a 37 L/100km**, mientras que los BEV oscilan entre **88 y 150 kWh/100km**.

2. **Segmentación por Función de Servicio y Paridad Operativa:**
   * **Combi ➔ Combi (Rutas capilares existentes):** Para ramales que ya operan con combis debido a calles angostas, topografía sinuosa o menor densidad (partes altas de Tlalpan, Álvaro Obregón, Xochimilco), la simulación modela la sustitución directa combi-a-combi para cuantificar la eficiencia energética y el ahorro en combustible (gasolina vs. electricidad), sin alterar la morfología de la ruta.
   * **Microbús ➔ Midibús (Corredores y troncales):** En ramales como el caso de estudio de Ruta 1 (San Fernando), no se plantea reducir microbuses a combis porque duplicaría el número de conductores y unidades para mover el mismo aforo; en ese caso el **Midibús de 26 a 28 plazas (BYD K7, Volare Access-E, Yutong E8)** es el reemplazo natural con paridad 1:1 de capacidad.

3. **Química de Baterías:**
   * La química **LFP (Fosfato de Hierro y Litio)** domina en los vehículos de trabajo pesado urbano (JAC, Yutong, BYD, DINA, Marcopolo) debido a su mayor ciclo de vida (3,000 a 5,000 ciclos), menor degradación ante cargas rápidas y estabilidad térmica.
   * Las químicas basadas en **NMC / Iones de Litio** (Volvo, Scania, Mercedes-Benz, Karsan-BMW) ofrecen mayor densidad gravimétrica (menor peso de paquete para igual capacidad), pero exigen una gestión térmica más estricta en el clima y altitud de CDMX.

---

## 5. Vinculación con los Expedientes del Proyecto

* **Dataset CSV editable:** [`catalogo-vehiculos-electricos-combustion.csv`](catalogo-vehiculos-electricos-combustion.csv).
* **Fuentes bibliográficas en APA y créditos:** [`docs/contexto/fichas-tecnicas-vehiculos.md`](../../contexto/fichas-tecnicas-vehiculos.md).
* **Parámetros de motor y simulación:** [`docs/desarrollo/metodologia-motor.md`](../../desarrollo/metodologia-motor.md).
* **Expediente de viabilidad Ruta 1:** [`docs/investigacion/ruta1/evaluacion-viabilidad-ruta1.md`](../ruta1/evaluacion-viabilidad-ruta1.md).
