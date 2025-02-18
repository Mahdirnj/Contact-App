"use client"

import type React from "react"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { createContext, useState, useEffect, useContext } from "react"

type Locale = "en" | "fa"

type Translations = {
  [key: string]: {
    [key: string]: string
  }
}

const translations: Translations = {
  en: {
    search: "Search contacts...",
    cancel: "Cancel",
    add: "Add contact",
    addContact: "Add Contact",
    editContact: "Edit Contact",
    settings: "Settings",
    light: "Light",
    dark: "Dark",
    system: "System",
    noContacts: "No contacts found",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    birthDate: "Birth Date",
    address: "Address",
    phoneNumber: "Phone Number",
    mobile: "Mobile",
    home: "Home",
    work: "Work",
    addPhone: "Add Phone Number",
    save: "Save",
    delete: "Delete",
    deleteContact: "Delete Contact",
    deleteContactConfirmation: "Are you sure you want to delete this contact? This action cannot be undone.",
    language: "Language",
    theme: "Theme",
    solarCalendar: "Use Solar Calendar",
    showLastNameFirst: "Show Last Name First",
    contactFormDescription: "Fill in the information for your contact below.",
    import: "Import contacts",
    export: "Export contacts",
    sort: "Sort contacts",
    firstNameAsc: "First name (A-Z)",
    firstNameDesc: "First name (Z-A)",
    lastNameAsc: "Last name (A-Z)",
    lastNameDesc: "Last name (Z-A)",
    importExport: "Import/Export",
    importSuccess: "Import Successful",
    importSuccessDescription: "Contacts have been imported successfully.",
    importError: "Import Failed",
    importErrorDescription: "There was an error importing contacts. Please try again.",
    exportSuccess: "Export Successful",
    exportSuccessDescription: "Contacts have been exported successfully.",
    exportError: "Export Failed",
    exportErrorDescription: "There was an error exporting contacts. Please try again.",
    totalContacts: "Total Contacts",
  },
  fa: {
    search: "جستجوی مخاطبین...",
    cancel: "لغو",
    add: "افزودن مخاطب",
    addContact: "افزودن مخاطب",
    editContact: "ویرایش مخاطب",
    settings: "تنظیمات",
    light: "روشن",
    dark: "تاریک",
    system: "سیستم",
    noContacts: "مخاطبی یافت نشد",
    firstName: "نام",
    lastName: "نام خانوادگی",
    email: "ایمیل",
    birthDate: "تاریخ تولد",
    address: "آدرس",
    phoneNumber: "شماره تلفن",
    mobile: "موبایل",
    home: "خانه",
    work: "محل کار",
    addPhone: "افزودن شماره تلفن",
    save: "ذخیره",
    delete: "حذف",
    deleteContact: "حذف مخاطب",
    deleteContactConfirmation: "آیا از حذف این مخاطب اطمینان دارید؟ این عمل قابل بازگشت نیست.",
    language: "زبان",
    theme: "تم",
    solarCalendar: "استفاده از تقویم شمسی",
    showLastNameFirst: "نمایش نام خانوادگی در ابتدا",
    contactFormDescription: "اطلاعات مخاطب خود را در زیر وارد کنید.",
    import: "وارد کردن مخاطبین",
    export: "خروجی گرفتن از مخاطبین",
    sort: "مرتب‌سازی مخاطبین",
    firstNameAsc: "نام (الف تا ی)",
    firstNameDesc: "نام (ی تا الف)",
    lastNameAsc: "نام خانوادگی (الف تا ی)",
    lastNameDesc: "نام خانوادگی (ی تا الف)",
    importExport: "وارد/خروج کردن",
    importSuccess: "وارد کردن با موفقیت انجام شد",
    importSuccessDescription: "مخاطبین با موفقیت وارد شدند.",
    importError: "وارد کردن ناموفق بود",
    importErrorDescription: "خطایی در وارد کردن مخاطبین رخ داد. لطفاً دوباره تلاش کنید.",
    exportSuccess: "خروجی گرفتن با موفقیت انجام شد",
    exportSuccessDescription: "از مخاطبین با موفقیت خروجی گرفته شد.",
    exportError: "خروجی گرفتن ناموفق بود",
    exportErrorDescription: "خطایی در خروجی گرفتن از مخاطبین رخ داد. لطفاً دوباره تلاش کنید.",
    totalContacts: "تعداد کل مخاطبین",
  },
}

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  isLoading: boolean
}>({
  locale: "en",
  setLocale: () => {},
  t: () => "",
  isLoading: true,
})

export function useLocale() {
  return useContext(LocaleContext)
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [locale, setLocale] = useState<Locale>("en")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedLocale = (localStorage.getItem("locale") as Locale) || "en"
    setLocale(savedLocale)
    setMounted(true)
    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("locale", locale)
    }
  }, [locale, mounted])

  const t = (key: string) => {
    return translations[locale][key] || key
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return null
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleContext.Provider value={{ locale, setLocale, t, isLoading }}>{children}</LocaleContext.Provider>
    </NextThemesProvider>
  )
}

