import { createInitialState } from "@/core/mockState"

import { buildProfileOverviewSections } from "./profileOverviewRows"

describe("buildProfileOverviewSections", () => {
  it("groups legal documents, contracts, and payslips under employment", () => {
    const sections = buildProfileOverviewSections({
      contractSummary: "1 awaiting signature",
      fullName: "Sofia Fischer",
      hasPendingContracts: true,
      hasRequiredDocuments: true,
      legalDocumentsSummary: "1 required",
      payslipsSummary: "March 2026",
      notificationCount: 3,
      state: createInitialState(),
      themeContext: "light",
    })

    const legalDocuments = sections.employment.find((item) => item.label === "Legal documents")
    const contracts = sections.employment.find((item) => item.label === "Contracts")
    const payslips = sections.employment.find((item) => item.label === "Payslips")

    expect(legalDocuments?.value).toBe("1 required")
    expect(legalDocuments?.badge).toBe("Missing")
    expect(legalDocuments?.badgeTone).toBe("danger")
    expect(contracts?.value).toBe("1 awaiting signature")
    expect(contracts?.badge).toBe("Needed")
    expect(contracts?.badgeTone).toBe("accent")
    expect(payslips?.value).toBe("March 2026")
    expect(legalDocuments?.route).toBe("/profile/legal-documents")
    expect(contracts?.route).toBe("/profile/contracts")
    expect(payslips?.route).toBe("/profile/payslips")
  })
})
