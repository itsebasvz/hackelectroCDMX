import type { Scenario, Vehicle, FinancialResult, Month } from './schema';
export const money = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export function monthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal === 0) return 0;
  const r = annualRate / 12;
  return money(
    r === 0 ? principal / months : (principal * r) / -Math.expm1(-months * Math.log1p(r)),
  );
}

/** Distribución que minimiza deuda para un presupuesto y aportación dados.
 * Enganche es un mínimo; comisiones se pagan al inicio y la reserva permanece separada.
 */
export function allocateCapital(
  eligible: number,
  fixed: number,
  support: number,
  budget: number,
  down: number,
  commission: number,
) {
  const E = Math.round(eligible * 100),
    F = Math.round(fixed * 100),
    S = Math.round(support * 100),
    B = Math.round(budget * 100);
  const fee = (principal: number) => Math.round(principal * commission);
  const remaining = (fixedSupport: number) => Math.max(0, E - Math.max(0, S - fixedSupport));
  const maxLoan = (fixedSupport: number) => Math.floor(remaining(fixedSupport) * (1 - down));
  const upfront = (fixedSupport: number, principal: number) =>
    F - fixedSupport + remaining(fixedSupport) - principal + fee(principal);
  // Menor asignación a costos no financiables que permite el enganche mínimo.
  let lo = Math.min(F, Math.max(0, S - E)),
    hi = Math.min(S, F);
  if (upfront(hi, maxLoan(hi)) <= B)
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (upfront(mid, maxLoan(mid)) <= B) hi = mid;
      else lo = mid + 1;
    }
  else lo = hi;
  const supportFixed = lo;
  // Principal mínimo que cabe en el capital propio, después de comisiones.
  lo = 0;
  hi = maxLoan(supportFixed);
  if (upfront(supportFixed, hi) <= B)
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (upfront(supportFixed, mid) <= B) hi = mid;
      else lo = mid + 1;
    }
  else lo = hi;
  const principal = lo;
  return {
    principal: principal / 100,
    fee: fee(principal) / 100,
    upfront: upfront(supportFixed, principal) / 100,
    supportFixed: supportFixed / 100,
    supportCapital: Math.min(E, Math.max(0, S - supportFixed)) / 100,
    unappliedSupport: Math.max(0, S - F - E) / 100,
  };
}

export function financial(
  s: Scenario,
  vehicle: Vehicle,
  operatingMonth: number,
  isEv: boolean,
): FinancialResult {
  operatingMonth = money(operatingMonth);
  const o = s.operation;
  const ec = s.economy;
  const f = s.finance;
  const fleet = o.fleet;
  const isLease = f.kind === 'lease' && isEv;
  const bundled = isEv && vehicle.includedChargerKw >= s.charger.powerKw;
  const equipment = isEv
    ? Math.max(0, s.chargerCount - (bundled ? fleet : 0)) * s.charger.price
    : 0;
  const infrastructure = isEv ? ec.siteBase + ec.sitePerCharger * s.chargerCount + equipment : 0;
  const assets = isLease ? 0 : vehicle.price * fleet;
  const capex = money(assets + infrastructure);
  const reserveInitial = ec.initialReserve * fleet;
  const support = isEv ? ec.support : 0;
  const credit = f.kind === 'credit';
  // En centavos: asignar apoyo entre obra/reserva y adquisición, respetando
  // enganche mínimo; usar capital disponible para reducir deuda, sin tocar reserva.
  const eligible = credit ? assets + (f.financeInfrastructure ? infrastructure : 0) : 0;
  const fixed = capex - eligible + reserveInitial;
  const allocation = allocateCapital(
    eligible,
    fixed,
    support,
    ec.ownCapital,
    f.downPayment,
    f.commissionRate,
  );
  const { principal, fee, upfront, supportFixed, supportCapital, unappliedSupport } = allocation;
  const payment = isLease
    ? money(f.leasePerUnitMonth * fleet)
    : monthlyPayment(principal, f.annualRate, f.months);
  const workerCost = money(ec.laborCost * o.operators * fleet);
  const ownerIncome = money(ec.ownerGoal * fleet);
  const revenue = money(o.boardings * o.fare * o.days * fleet);
  const reserveAdd = money(ec.monthlyReserve * fleet);
  let balance = principal;
  let interestTotal = 0;
  let reserve = reserveInitial;
  let cumulativeReplacement = 0;
  const months: Month[] = [];
  for (let month = 1; month <= 60; month++) {
    const interest = credit && month <= f.months ? money((balance * f.annualRate) / 12) : 0;
    const actualPayment = isLease
      ? payment
      : credit && month <= f.months
        ? Math.min(payment, money(balance + interest))
        : 0;
    const amortization = credit ? money(Math.max(0, actualPayment - interest)) : 0;
    balance = money(Math.max(0, balance - amortization));
    // Cerrar exclusivamente el último pago por redondeo, sin perdonar saldo intermedio.
    const finalCorrection = credit && month === f.months ? balance : 0;
    if (finalCorrection > 0) balance = 0;
    const replacement =
      isEv && ec.batteryReplacementMonth === month ? money(ec.batteryReplacementCost * fleet) : 0;
    cumulativeReplacement += replacement;
    const reserveUse = Math.min(reserve + reserveAdd, replacement);
    reserve = money(reserve + reserveAdd - reserveUse);
    const freeCash = money(
      revenue -
        operatingMonth -
        workerCost -
        ownerIncome -
        actualPayment -
        finalCorrection -
        reserveAdd -
        (replacement - reserveUse),
    );
    months.push({
      month,
      revenue,
      operating: money(operatingMonth),
      workerCost,
      ownerIncome,
      payment: money(actualPayment + finalCorrection),
      interest,
      principal: money(amortization + finalCorrection),
      balance,
      reserve,
      freeCash,
      replacement,
    });
    interestTotal = money(interestTotal + interest);
  }
  const residual = isLease ? 0 : money(assets * ec.residualFraction);
  const leaseTotal = isLease ? payment * 60 : 0;
  const economicCost = money(
    capex +
      fee +
      (operatingMonth + workerCost) * 60 +
      interestTotal +
      leaseTotal +
      cumulativeReplacement -
      residual,
  );
  const totalKm = s.route.cycleKm * o.cycles * (1 + o.emptyRatio) * o.days * 60 * fleet;
  return {
    capex,
    upfront,
    ownRequired: upfront,
    unappliedSupport,
    principal,
    payment,
    months,
    minMonthlyCash: Math.min(...months.map((m) => m.freeCash)),
    operatingMonth: money(operatingMonth),
    protectedMonth: workerCost + ownerIncome,
    economicCost,
    costPerKm: economicCost / totalKm,
    interestTotal,
    debtRemaining: balance,
    reserveEnd: reserve,
    residual,
    support,
    supportFixed,
    supportCapital,
    financingFee: fee,
  };
}
