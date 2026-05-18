import type { DocumentStatus } from "@/core/models"

export type DocumentCategory = "required" | "payslips" | "contracts"

export interface Payslip {
  id: string
  month: string
  period: string
  net: string
  date: string
  rows: { label: string; amount: string; type: "plus" | "minus" }[]
}

export interface Contract {
  id: string
  name: string
  type: string
  date: string
  status: "signed" | "pending"
  body: string
}

export interface DocumentStatusConfig {
  backgroundColor: string
  color: string
  icon: string
  label: string
}

export type DisplayDocumentStatus = DocumentStatus | Contract["status"]
