import { toUpdateMyEmployeeDto, toUserProfile } from "./profile.transformer"

const employeeDto = {
  uniqueCode: "emp-uuid",
  firstName: "Demo",
  lastName: "Employee",
  iban: "BE00",
  ssin: "123",
  address: { street: "Main", houseNumber: "1", boxNumber: null, zipCode: "1000", city: "Brussels", country: "BE" },
  email: "demo@vesta.local",
  phoneNumber: "+32",
  culture: "nl-BE",
  isActive: true,
  employerUniqueCode: "emp-1",
  employerName: "Bistro",
}

describe("profile.transformer", () => {
  it("maps EmployeeDto to UserProfile core fields", () => {
    const p = toUserProfile(employeeDto as any)
    expect(p.id).toBe("emp-uuid")
    expect(p.firstName).toBe("Demo")
    expect(p.email).toBe("demo@vesta.local")
    expect(p.phone).toBe("+32")
    expect(p.address.city).toBe("Brussels")
    expect(p.address.postalCode).toBe("1000")
    expect(p.address.street).toBe("Main 1")
    expect(p.legal.socialSecurityNumber).toBe("123")
    expect(p.bankAccount.iban).toBe("BE00")
    expect(p.language).toBe("nl-BE")
    expect(p.onboardingComplete).toBe(true)
  })
  it("maps a partial UserProfile to UpdateMyEmployeeDto", () => {
    const dto = toUpdateMyEmployeeDto({ firstName: "Newname", phone: "+33", address: { street: "X", postalCode: "2000", city: "Antwerp", country: "BE" } })
    expect(dto.firstName).toBe("Newname")
    expect(dto.phoneNumber).toBe("+33")
    expect(dto.address?.zipCode).toBe("2000")
    expect(dto.address?.city).toBe("Antwerp")
    expect(dto.lastName).toBeUndefined()
  })
})
