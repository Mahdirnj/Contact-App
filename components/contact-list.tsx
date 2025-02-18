"use client"

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ContactForm, type ContactFormData } from "./contact-form"
import { Edit2, Trash2, Mail, Phone, MapPin, Calendar } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "./ui/button"
import { useLocale } from "./providers"

interface ContactListProps {
  contacts: ContactFormData[]
  onEditContact: (data: ContactFormData) => void
  onDeleteContact: (id: string) => void
}

const ContactCard = React.memo(
  ({
    contact,
    onEdit,
    onDelete,
    t,
  }: {
    contact: ContactFormData
    onEdit: () => void
    onDelete: () => void
    t: (key: string) => string
  }) => (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative group bg-card rounded-lg p-4 border hover:shadow-lg transition-shadow"
    >
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-20 w-20">
          {contact.image ? <AvatarImage src={contact.image} alt={`${contact.firstName} ${contact.lastName}`} /> : null}
          <AvatarFallback className="text-lg">
            {contact.firstName?.[0]}
            {contact.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1 w-full">
          <h3 className="font-medium">
            {contact.firstName} {contact.lastName}
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            {contact.phoneNumbers.map((phone, idx) => (
              <div key={`${contact.id}-phone-${idx}`} className="flex items-center justify-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{phone.number}</span>
                <span className="text-xs">({t(phone.type)})</span>
              </div>
            ))}
            {contact.email && (
              <div className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" />
                <span>{contact.email}</span>
              </div>
            )}
            {contact.birthDate && (
              <div className="flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{contact.birthDate}</span>
              </div>
            )}
            {contact.address && (
              <div className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{contact.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  ),
)

ContactCard.displayName = "ContactCard"

export function ContactList({ contacts, onEditContact, onDeleteContact }: ContactListProps) {
  const [selectedContact, setSelectedContact] = useState<ContactFormData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useLocale()
  const parentRef = useRef<HTMLDivElement>(null)
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth
      if (width >= 1280) setColumnCount(4)
      else if (width >= 1024) setColumnCount(3)
      else if (width >= 640) setColumnCount(2)
      else setColumnCount(1)
    }

    updateColumnCount()
    window.addEventListener("resize", updateColumnCount)
    return () => window.removeEventListener("resize", updateColumnCount)
  }, [])

  const rowCount = Math.ceil(contacts.length / columnCount)

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 280, []),
    overscan: 5,
  })

  const handleEditContact = useCallback(
    (data: ContactFormData) => {
      onEditContact(data)
      setSelectedContact(null)
      setIsEditing(false)
    },
    [onEditContact],
  )

  const handleDeleteContact = useCallback(() => {
    if (selectedContact) {
      onDeleteContact(selectedContact.id)
      setSelectedContact(null)
      setIsDeleting(false)
    }
  }, [selectedContact, onDeleteContact])

  const memoizedContacts = useMemo(() => contacts, [contacts])

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b px-4 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <p className="text-sm text-muted-foreground">
          {t("totalContacts")}: {contacts.length}
        </p>
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto">
        <div
          className="relative w-full"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          <AnimatePresence>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rowStartIndex = virtualRow.index * columnCount
              const rowContacts = memoizedContacts.slice(rowStartIndex, rowStartIndex + columnCount)

              return (
                <div
                  key={virtualRow.index}
                  className="absolute top-0 left-0 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {rowContacts.map((contact) => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={() => {
                        setSelectedContact(contact)
                        setIsEditing(true)
                      }}
                      onDelete={() => {
                        setSelectedContact(contact)
                        setIsDeleting(true)
                      }}
                      t={t}
                    />
                  ))}
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      <ContactForm
        open={isEditing}
        onClose={() => {
          setIsEditing(false)
          setSelectedContact(null)
        }}
        onSubmit={handleEditContact}
        initialData={selectedContact}
      />

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteContact")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteContactConfirmation")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContact}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

