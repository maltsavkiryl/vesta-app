import type { Contract, DocumentCategory, Payslip } from "./documents.types"

export const documentCategories: { id: DocumentCategory; label: string }[] = [
  { id: "required", label: "Required" },
  { id: "payslips", label: "Payslips" },
  { id: "contracts", label: "Contracts" },
]

export const payslips: Payslip[] = [
  {
    date: "Apr 1, 2026",
    id: "payslip-1",
    month: "March 2026",
    net: "€1,847.50",
    period: "Mar 1 - Mar 31",
    rows: [
      { amount: "€1,875.12", label: "Regular hours (156h x €12.02)", type: "plus" },
      { amount: "€72.12", label: "Overtime bonus", type: "plus" },
      { amount: "-€74.96", label: "NSSO contribution", type: "minus" },
      { amount: "-€24.78", label: "Advance holiday pay", type: "minus" },
    ],
  },
  {
    date: "Mar 1, 2026",
    id: "payslip-2",
    month: "February 2026",
    net: "€1,923.20",
    period: "Feb 1 - Feb 28",
    rows: [
      { amount: "€1,923.20", label: "Regular hours (160h x €12.02)", type: "plus" },
      { amount: "-€76.93", label: "NSSO contribution", type: "minus" },
      { amount: "-€25.74", label: "Advance holiday pay", type: "minus" },
    ],
  },
  {
    date: "Feb 1, 2026",
    id: "payslip-3",
    month: "January 2026",
    net: "€1,765.80",
    period: "Jan 1 - Jan 31",
    rows: [
      { amount: "€1,730.88", label: "Regular hours (144h x €12.02)", type: "plus" },
      { amount: "€34.92", label: "Holiday supplement", type: "plus" },
      { amount: "-€70.63", label: "NSSO contribution", type: "minus" },
    ],
  },
]

const contractBody =
  "This employment contract is entered into between Bistro Noir BVBA and Sofia Fischer, effective January 15, 2026.\n\n1. POSITION\nThe employee is engaged as Waiter/Waitress on a part-time basis, averaging 24 hours per week.\n\n2. COMPENSATION\nGross hourly wage of €12.02, payable monthly on the 1st.\n\n3. WORKING HOURS\nShifts assigned weekly by the employer. The employee agrees to maintain their availability profile."

const amendmentBody =
  "This amendment to the employment contract is entered into between Bistro Noir BVBA and Sofia Fischer, effective March 1, 2026.\n\n1. AMENDMENT\nEffective March 1, 2026, the employee's Friday evening shift will run from 17:00 to 00:00 midnight.\n\n2. COMPENSATION\nExtended hours are compensated at the existing rate of €12.02/h."

export const initialContracts: Contract[] = [
  {
    body: contractBody,
    date: "Jan 15, 2026",
    id: "contract-1",
    name: "Employment Contract",
    status: "signed",
    type: "Part-time",
  },
  {
    body: amendmentBody,
    date: "Mar 1, 2026",
    id: "contract-2",
    name: "Schedule Amendment",
    status: "pending",
    type: "Amendment",
  },
]
