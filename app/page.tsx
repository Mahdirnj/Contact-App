"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { ContactList } from "@/components/contact-list"
import { Header } from "@/components/header"
import type { ContactFormData } from "@/components/contact-form"
import { exportContacts, importContacts } from "@/utils/vcf"
import { sortContacts, type SortOrder } from "@/utils/sort"
import { useLocale } from "@/components/providers"
import { v4 as uuidv4 } from "uuid"

export default function Home() {
  const [contacts, setContacts] = useState<ContactFormData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("firstNameAsc")
  const { locale, isLoading } = useLocale()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem("contacts")
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts))
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("contacts", JSON.stringify(contacts))
    }
  }, [contacts, isInitialized])

  const handleAddContact = useCallback((data: ContactFormData) => {
    setContacts((prev) => [...prev, { ...data, id: uuidv4() }])
  }, [])

  const handleEditContact = useCallback((data: ContactFormData) => {
    setContacts((prev) => prev.map((contact) => (contact.id === data.id ? data : contact)))
  }, [])

  const handleDeleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
  }, [])

  const handleImport = useCallback(async (file: File) => {
    const importedContacts = await importContacts(file)
    setContacts((prev) => [
      ...prev,
      ...importedContacts.map((contact) => ({
        ...contact,
        id: uuidv4(),
      })),
    ])
  }, [])

  const handleExport = useCallback(() => {
    exportContacts(contacts)
  }, [contacts])

  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return contacts.filter(
      (contact) =>
        contact.firstName.toLowerCase().includes(query) ||
        contact.lastName.toLowerCase().includes(query) ||
        contact.phoneNumbers.some((phone) => phone.number.includes(query)) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.address?.toLowerCase().includes(query),
    )
  }, [contacts, searchQuery])

  const sortedContacts = useMemo(
    () => sortContacts(filteredContacts, sortOrder, locale),
    [filteredContacts, sortOrder, locale],
  )

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-pulse w-32 h-32 rounded-full bg-muted mx-auto" />
          <div className="animate-pulse h-4 w-48 bg-muted rounded mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header
        onAddContact={handleAddContact}
        onSearch={setSearchQuery}
        onSortChange={setSortOrder}
        sortOrder={sortOrder}
        onImport={handleImport}
        onExport={handleExport}
      />
      <ContactList contacts={sortedContacts} onEditContact={handleEditContact} onDeleteContact={handleDeleteContact} />
    </main>
  )
}

