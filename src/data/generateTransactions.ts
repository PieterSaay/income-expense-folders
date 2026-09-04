import type { Transaction } from "../types";

// Deterministic PRNG so the synthetic ledger is stable across reloads/tests.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface MerchantTemplate {
  merchant: string;
  description: string;
  amountRange: [number, number];
  /** how many times this merchant tends to appear per month */
  frequencyPerMonth: number;
  /** fixed day-of-month, for recurring debit orders */
  fixedDay?: number;
}

const groceries: MerchantTemplate[] = [
  { merchant: "Checkers", description: "Grocery shopping", amountRange: [-950, -220], frequencyPerMonth: 5 },
  { merchant: "Woolworths", description: "Grocery shopping", amountRange: [-680, -150], frequencyPerMonth: 3 },
  { merchant: "Pick n Pay", description: "Grocery shopping", amountRange: [-540, -90], frequencyPerMonth: 4 },
];

const petrol: MerchantTemplate[] = [
  { merchant: "Shell", description: "Fuel purchase", amountRange: [-900, -450], frequencyPerMonth: 3 },
  { merchant: "Engen", description: "Fuel purchase", amountRange: [-850, -400], frequencyPerMonth: 2 },
];

const debitOrders: MerchantTemplate[] = [
  { merchant: "Discovery Health", description: "Medical aid premium", amountRange: [-3200, -3200], frequencyPerMonth: 1, fixedDay: 1 },
  { merchant: "Outsurance", description: "Vehicle & home insurance", amountRange: [-1450, -1450], frequencyPerMonth: 1, fixedDay: 2 },
  { merchant: "Netflix", description: "Streaming subscription", amountRange: [-199, -199], frequencyPerMonth: 1, fixedDay: 5 },
  { merchant: "Vodacom", description: "Cellphone contract", amountRange: [-699, -699], frequencyPerMonth: 1, fixedDay: 25 },
  { merchant: "Planet Fitness", description: "Gym membership", amountRange: [-399, -399], frequencyPerMonth: 1, fixedDay: 28 },
];

const entertainment: MerchantTemplate[] = [
  { merchant: "Ster-Kinekor", description: "Movie tickets", amountRange: [-260, -90], frequencyPerMonth: 1 },
  { merchant: "Uber Eats", description: "Food delivery", amountRange: [-380, -140], frequencyPerMonth: 3 },
  { merchant: "Steam", description: "Game purchase", amountRange: [-450, -60], frequencyPerMonth: 1 },
];

const health: MerchantTemplate[] = [
  { merchant: "Clicks Pharmacy", description: "Pharmacy purchase", amountRange: [-320, -60], frequencyPerMonth: 2 },
  { merchant: "Dis-Chem", description: "Pharmacy purchase", amountRange: [-280, -50], frequencyPerMonth: 1 },
];

const misc: MerchantTemplate[] = [
  { merchant: "Takealot", description: "Online purchase", amountRange: [-1200, -150], frequencyPerMonth: 1 },
  { merchant: "Mr Price", description: "Clothing purchase", amountRange: [-650, -180], frequencyPerMonth: 1 },
  { merchant: "Builders Warehouse", description: "Hardware & home", amountRange: [-900, -120], frequencyPerMonth: 1 },
  { merchant: "ATM Withdrawal", description: "Cash withdrawal", amountRange: [-2000, -300], frequencyPerMonth: 2 },
];

const income: MerchantTemplate[] = [
  { merchant: "Acme Corp", description: "Salary", amountRange: [28000, 28000], frequencyPerMonth: 1, fixedDay: 25 },
];

const allTemplates = [
  ...groceries,
  ...petrol,
  ...debitOrders,
  ...entertainment,
  ...health,
  ...misc,
  ...income,
];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

/**
 * Generates a synthetic transaction ledger for the last `months` full
 * calendar months, ordered by date descending (newest first) — same
 * shape a real bank statement export arrives in.
 */
export function generateTransactions(months = 3, seed = 42): Transaction[] {
  const rand = mulberry32(seed);
  const transactions: Transaction[] = [];
  const now = new Date();
  let counter = 0;

  for (let m = months - 1; m >= 0; m--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = monthDate.getFullYear();
    const monthIndex = monthDate.getMonth();
    const totalDays = daysInMonth(year, monthIndex);

    for (const template of allTemplates) {
      for (let occurrence = 0; occurrence < template.frequencyPerMonth; occurrence++) {
        const day = template.fixedDay ?? 1 + Math.floor(rand() * totalDays);
        const [min, max] = template.amountRange;
        const amount = Math.round(min + rand() * (max - min));
        const date = `${year}-${pad(monthIndex + 1)}-${pad(Math.min(day, totalDays))}`;
        counter++;
        transactions.push({
          id: `txn-${counter}`,
          date,
          merchant: template.merchant,
          description: template.description,
          amount,
        });
      }
    }
  }

  return transactions.sort((a, b) => (a.date < b.date ? 1 : -1));
}
