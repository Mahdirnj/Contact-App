const fa = new Intl.Collator("fa")
const en = new Intl.Collator("en")

export type SortOrder = "firstNameAsc" | "firstNameDesc" | "lastNameAsc" | "lastNameDesc"

export function sortContacts(contacts: any[], order: SortOrder, locale: "en" | "fa") {
  const collator = locale === "fa" ? fa : en

  return [...contacts].sort((a, b) => {
    if (order === "firstNameAsc") {
      return collator.compare(a.firstName, b.firstName)
    }
    if (order === "firstNameDesc") {
      return collator.compare(b.firstName, a.firstName)
    }
    if (order === "lastNameAsc") {
      return collator.compare(a.lastName, b.lastName)
    }
    if (order === "lastNameDesc") {
      return collator.compare(b.lastName, a.lastName)
    }
    return 0
  })
}

