"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Plus, Settings, Search, SortAsc } from "lucide-react"
import { useTheme } from "next-themes"
import { useState } from "react"
import { motion } from "framer-motion"
import { ContactForm, type ContactFormData } from "./contact-form"
import { SettingsDialog } from "./settings-dialog"
import { useLocale } from "./providers"
import type { SortOrder } from "@/utils/sort"

interface HeaderProps {
  onSearch: (query: string) => void
  onAddContact: (data: ContactFormData) => void
  onSortChange: (order: SortOrder) => void
  sortOrder: SortOrder
  onImport: (file: File) => void
  onExport: () => void
}

export function Header({ onSearch, onAddContact, onSortChange, sortOrder, onImport, onExport }: HeaderProps) {
  const { setTheme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useLocale()

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center w-full mr-2"
              >
                <Input
                  type="search"
                  placeholder={t("search")}
                  className="w-full"
                  autoFocus
                  onChange={(e) => onSearch(e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    setIsSearchOpen(false)
                    onSearch("")
                  }}
                >
                  {t("cancel")}
                </Button>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                    <Search className="h-5 w-5" />
                    <span className="sr-only">{t("search")}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <SortAsc className="h-5 w-5" />
                        <span className="sr-only">{t("sort")}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={sortOrder}
                        onValueChange={(value: SortOrder) => onSortChange(value)}
                      >
                        <DropdownMenuRadioItem value="firstNameAsc">{t("firstNameAsc")}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="firstNameDesc">{t("firstNameDesc")}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="lastNameAsc">{t("lastNameAsc")}</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="lastNameDesc">{t("lastNameDesc")}</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setIsAddingContact(true)}>
                    <Plus className="h-5 w-5" />
                    <span className="sr-only">{t("add")}</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">{t("settings")}</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setTheme("light")}>{t("light")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>{t("dark")}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("system")}>{t("system")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ContactForm
        open={isAddingContact}
        onClose={() => setIsAddingContact(false)}
        onSubmit={(data) => {
          onAddContact(data)
          setIsAddingContact(false)
        }}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onImport={onImport}
        onExport={onExport}
      />
    </>
  )
}

