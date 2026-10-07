export interface Field {
  path: string;
  label: string;
  unit: string;
  step?: number;
  percent?: boolean;
  help?: string;
}
export interface Section {
  id: string;
  title: string;
  description: string;
  fields: Field[];
}
export const sections: Section[] = [
  {
    id: 'service',
    title: 'Servicio y personas',
    description:
      'La demanda y los horarios son supuestos sustituibles. Durante la búsqueda se mantienen fijos.',
    fields: [
      {
        path: 'route.cycleKm',
        label: 'Longitud del ciclo de prueba',
        unit: 'km',
        step: 0.01,
        help: 'Suma cartográfica histórica; editable, no medición del servicio actual.',
      },
      { path: 'operation.fleet', label: 'Unidades operativas', unit: 'unidades' },
      { path: 'operation.cycles', label: 'Ciclos diarios por unidad', unit: 'ciclos' },
      { path: 'operation.cycleMinutes', label: 'Tiempo por ciclo', unit: 'min' },
      { path: 'operation.maxHeadwayMinutes', label: 'Intervalo máximo objetivo', unit: 'min' },
      { path: 'operation.serviceHours', label: 'Ventana diaria de servicio', unit: 'h', step: 0.5 },
      {
        path: 'operation.emptyRatio',
        label: 'Kilómetros adicionales',
        unit: '%',
        percent: true,
        help: 'Vacío y patio, sumados una sola vez.',
      },
      { path: 'operation.emptySpeedKmh', label: 'Velocidad para km adicionales', unit: 'km/h' },
      {
        path: 'operation.days',
        label: 'Días operativos al mes',
        unit: 'días',
        help: 'Días de la unidad; no una jornada individual.',
      },
      { path: 'operation.requiredCapacity', label: 'Capacidad mínima efectiva', unit: 'pasajeros' },
      {
        path: 'operation.boardings',
        label: 'Ascensos diarios por unidad',
        unit: 'ascensos',
        help: 'Incluye renovación de pasajeros durante el recorrido. No aforo de Ruta 1.',
      },
      { path: 'operation.fare', label: 'Tarifa de prueba', unit: 'MXN', step: 0.5 },
      { path: 'operation.operators', label: 'Operadores por unidad', unit: 'personas' },
      { path: 'operation.maxShiftHours', label: 'Jornada máxima de prueba', unit: 'h', step: 0.5 },
      {
        path: 'operation.handlingHours',
        label: 'Maniobras pagadas por unidad',
        unit: 'h/día',
        step: 0.25,
      },
      { path: 'economy.laborCost', label: 'Costo laboral por persona', unit: 'MXN/mes', step: 500 },
      {
        path: 'economy.incomeGoal',
        label: 'Ingreso objetivo por operador',
        unit: 'MXN/mes',
        step: 500,
      },
      {
        path: 'economy.ownerGoal',
        label: 'Ingreso objetivo concesionario',
        unit: 'MXN/unidad/mes',
        step: 500,
      },
    ],
  },
  {
    id: 'vehicles',
    title: 'Vehículos comparables',
    description:
      'Editar crea una configuración del escenario. El catálogo original permanece conservado.',
    fields: [
      {
        path: 'ice.price',
        label: 'Adquisición de combustión completa',
        unit: 'MXN/unidad',
        step: 10000,
      },
      { path: 'ice.capacity', label: 'Capacidad efectiva de combustión', unit: 'pasajeros' },
      { path: 'ice.consumption', label: 'Rendimiento de combustión', unit: 'km/L', step: 0.1 },
      {
        path: 'ice.maintenancePerKm',
        label: 'Mantenimiento de combustión',
        unit: 'MXN/km',
        step: 0.1,
      },
      {
        path: 'ice.insuranceMonth',
        label: 'Seguro de combustión',
        unit: 'MXN/unidad/mes',
        step: 100,
      },
      {
        path: 'ev.price',
        label: 'Adquisición eléctrica completa',
        unit: 'MXN/unidad',
        step: 10000,
      },
      { path: 'ev.capacity', label: 'Capacidad efectiva eléctrica', unit: 'pasajeros' },
      { path: 'ev.batteryKwh', label: 'Batería nominal', unit: 'kWh', step: 0.1 },
      {
        path: 'ev.consumption',
        label: 'Consumo neto en batería',
        unit: 'kWh/km',
        step: 0.01,
        help: 'Ya incluye auxiliares y regeneración; no se descuenta nuevamente.',
      },
      { path: 'ev.maxChargeKw', label: 'Potencia admitida por el vehículo', unit: 'kW', step: 1 },
      {
        path: 'ev.includedChargerKw',
        label: 'Cargador incluido en adquisición',
        unit: 'kW',
        help: 'Cero si no está incluido. Evita duplicar inversión del kit.',
      },
      { path: 'ev.maintenancePerKm', label: 'Mantenimiento eléctrico', unit: 'MXN/km', step: 0.1 },
      { path: 'ev.insuranceMonth', label: 'Seguro eléctrico', unit: 'MXN/unidad/mes', step: 100 },
    ],
  },
  {
    id: 'energy',
    title: 'Energía y lugar de carga',
    description:
      'La cercanía al trolebús no acredita conexión. Esta configuración de patio necesita verificación.',
    fields: [
      { path: 'energy.fuelPrice', label: 'Precio de combustible', unit: 'MXN/L', step: 0.01 },
      {
        path: 'energy.electricityPrice',
        label: 'Electricidad variable',
        unit: 'MXN/kWh',
        step: 0.1,
      },
      {
        path: 'energy.demandPrice',
        label: 'Cargo de potencia atribuible',
        unit: 'MXN/kW/mes',
        step: 10,
      },
      {
        path: 'energy.fixedElectricity',
        label: 'Cargo eléctrico fijo',
        unit: 'MXN/flota/mes',
        step: 100,
      },
      {
        path: 'energy.efficiency',
        label: 'Eficiencia medidor a batería',
        unit: '%',
        percent: true,
      },
      { path: 'energy.soh', label: 'Salud de batería', unit: '%', percent: true },
      { path: 'energy.socMin', label: 'SOC mínimo con reserva', unit: '%', percent: true },
      { path: 'energy.socMax', label: 'SOC máximo', unit: '%', percent: true },
      { path: 'energy.chargeHours', label: 'Ventana nocturna de carga', unit: 'h', step: 0.5 },
      { path: 'energy.siteKw', label: 'Potencia total del sitio', unit: 'kW', step: 5 },
      { path: 'energy.otherSiteKw', label: 'Potencia para otros usos', unit: 'kW', step: 1 },
      {
        path: 'energy.taperSoc',
        label: 'Inicio de reducción de potencia',
        unit: '% SOC',
        percent: true,
      },
      {
        path: 'energy.taperFactor',
        label: 'Potencia después del umbral',
        unit: '%',
        percent: true,
      },
      { path: 'chargerCount', label: 'Número de cargadores', unit: 'cargadores' },
      { path: 'charger.powerKw', label: 'Potencia por cargador', unit: 'kW' },
      { path: 'charger.price', label: 'Precio por cargador', unit: 'MXN', step: 1000 },
      { path: 'economy.siteBase', label: 'Obra eléctrica base', unit: 'MXN/flota', step: 10000 },
      {
        path: 'economy.sitePerCharger',
        label: 'Instalación por cargador',
        unit: 'MXN',
        step: 1000,
      },
      { path: 'economy.depotMonth', label: 'Costo del patio', unit: 'MXN/flota/mes', step: 500 },
      {
        path: 'energy.gridFactor',
        label: 'Factor eléctrico indirecto',
        unit: 'kgCO₂e/kWh',
        step: 0.001,
      },
    ],
  },
  {
    id: 'finance',
    title: 'Financiamiento y liquidez',
    description:
      'Condiciones hipotéticas. Mantener flujo e ingreso es distinto de ahorrar combustible.',
    fields: [
      {
        path: 'economy.ownCapital',
        label: 'Capital inicial propio disponible',
        unit: 'MXN/flota',
        step: 10000,
      },
      {
        path: 'economy.support',
        label: 'Aportación inicial hipotética',
        unit: 'MXN/flota',
        step: 10000,
      },
      { path: 'finance.annualRate', label: 'Tasa nominal anual', unit: '%', percent: true },
      { path: 'finance.months', label: 'Plazo del crédito', unit: 'meses' },
      { path: 'finance.downPayment', label: 'Enganche mínimo', unit: '%', percent: true },
      {
        path: 'finance.commissionRate',
        label: 'Comisión sobre principal',
        unit: '%',
        percent: true,
      },
      {
        path: 'finance.leasePerUnitMonth',
        label: 'Renta mensual del proveedor',
        unit: 'MXN/unidad',
        step: 500,
      },
      { path: 'economy.adminMonth', label: 'Administración', unit: 'MXN/unidad/mes', step: 100 },
      {
        path: 'economy.initialReserve',
        label: 'Reserva inicial de liquidez',
        unit: 'MXN/unidad',
        step: 5000,
      },
      {
        path: 'economy.monthlyReserve',
        label: 'Aportación mensual a reserva',
        unit: 'MXN/unidad',
        step: 100,
      },
      {
        path: 'economy.residualFraction',
        label: 'Valor residual de vehículos',
        unit: '%',
        percent: true,
      },
      {
        path: 'economy.batteryReplacementMonth',
        label: 'Mes de reemplazo de batería',
        unit: 'mes; 0 = no programado',
        help: 'No programarlo es un supuesto, no una garantía de duración.',
      },
      {
        path: 'economy.batteryReplacementCost',
        label: 'Costo de batería de reemplazo',
        unit: 'MXN/unidad',
        step: 10000,
      },
    ],
  },
];
