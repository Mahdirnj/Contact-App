"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X } from "lucide-react"
import { useLocale } from "./providers"
import { v4 as uuidv4 } from "uuid"

export type ContactFormData = {
  id: string
  firstName: string
  lastName: string
  phoneNumbers: Array<{ id: string; type: string; number: string }>
  email: string
  birthDate: string
  address: string
  image?: string
}

type ContactFormProps = {
  open: boolean
  onClose: () => void
  onSubmit: (data: ContactFormData) => void
  initialData?: ContactFormData | null
}

const emptyContact: ContactFormData = {
  id: "",
  firstName: "",
  lastName: "",
  phoneNumbers: [{ id: uuidv4(), type: "mobile", number: "" }],
  email: "",
  birthDate: "",
  address: "",
}

export function ContactForm({ open, onClose, onSubmit, initialData }: ContactFormProps) {
  const { t } = useLocale()
  const [formData, setFormData] = useState<ContactFormData>(emptyContact)

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        phoneNumbers: initialData.phoneNumbers.map((phone) => ({
          ...phone,
          id: phone.id || uuidv4(),
        })),
      })
    } else {
      setFormData({ ...emptyContact, id: uuidv4() })
    }
  }, [initialData])

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const addPhoneNumber = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: [...prev.phoneNumbers, { id: uuidv4(), type: "mobile", number: "" }],
    }))
  }, [])

  const removePhoneNumber = useCallback(
    (id: string) => {
      if (formData.phoneNumbers.length > 1) {
        setFormData((prev) => ({
          ...prev,
          phoneNumbers: prev.phoneNumbers.filter((phone) => phone.id !== id),
        }))
      }
    },
    [formData.phoneNumbers.length],
  )

  const handlePhoneNumberChange = useCallback((id: string, field: "type" | "number", value: string) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumbers: prev.phoneNumbers.map((phone) => (phone.id === id ? { ...phone, [field]: value } : phone)),
    }))
  }, [])

  const handleBirthDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length > 0) {
      if (value.length <= 4) {
        value = value
      } else if (value.length <= 6) {
        value = `${value.slice(0, 4)}/${value.slice(4)}`
      } else {
        value = `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)}`
      }
    }
    setFormData((prev) => ({ ...prev, birthDate: value }))
  }, [])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
    },
    [formData, onSubmit],
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[425px] h-[85vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>{initialData ? t("editContact") : t("addContact")}</DialogTitle>
          <DialogDescription>{t("contactFormDescription")}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6">
          <form id="contact-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="flex justify-center py-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.image} />
                  <AvatarFallback>
                    {formData.firstName?.[0] || ""}
                    {formData.lastName?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 p-1 rounded-full bg-primary text-primary-foreground cursor-pointer"
                >
                  <Camera className="h-4 w-4" />
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageUpload}
                  />
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              {formData.phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex gap-2">
                  <Select
                    value={phone.type}
                    onValueChange={(value) => handlePhoneNumberChange(phone.id, "type", value)}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mobile">{t("mobile")}</SelectItem>
                      <SelectItem value="home">{t("home")}</SelectItem>
                      <SelectItem value="work">{t("work")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={phone.number}
                      onChange={(e) => handlePhoneNumberChange(phone.id, "number", e.target.value)}
                      placeholder={t("phoneNumber")}
                      required
                    />
                    {formData.phoneNumbers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 shrink-0"
                        onClick={() => removePhoneNumber(phone.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="w-full" onClick={addPhoneNumber}>
                {t("addPhone")}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">{t("birthDate")}</Label>
              <Input
                id="birthDate"
                type="text"
                value={formData.birthDate}
                onChange={handleBirthDateChange}
                placeholder="YYYY/MM/DD"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">{t("address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </form>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button type="submit" form="contact-form">
            {initialData ? t("save") : t("add")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

