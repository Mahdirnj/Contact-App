"use client"

import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useLocale } from "./providers"
import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { Import, ImportIcon as Export } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type SettingsDialogProps = {
  open: boolean
  onClose: () => void
  onImport: (file: File) => void
  onExport: () => void
}

type Settings = {
  showLastNameFirst: boolean
}

export function SettingsDialog({ open, onClose, onImport, onExport }: SettingsDialogProps) {
  const { locale, setLocale, t } = useLocale()
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings")
      return saved ? JSON.parse(saved) : { showLastNameFirst: false }
    }
    return { showLastNameFirst: false }
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings))
  }, [settings])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        await onImport(file)
        toast({
          title: t("importSuccess"),
          description: t("importSuccessDescription"),
        })
      } catch (error) {
        console.error("Import error:", error)
        toast({
          title: t("importError"),
          description: t("importErrorDescription"),
          variant: "destructive",
        })
      }
      e.target.value = "" // Reset input
    }
  }

  const handleExport = () => {
    try {
      onExport()
      toast({
        title: t("exportSuccess"),
        description: t("exportSuccessDescription"),
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: t("exportError"),
        description: t("exportErrorDescription"),
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>{t("language")}</Label>
            <Select value={locale} onValueChange={(value: "en" | "fa") => setLocale(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fa">فارسی</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("theme")}</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t("light")}</SelectItem>
                <SelectItem value="dark">{t("dark")}</SelectItem>
                <SelectItem value="system">{t("system")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="lastname-first">{t("showLastNameFirst")}</Label>
            <Switch
              id="lastname-first"
              checked={settings.showLastNameFirst}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showLastNameFirst: checked }))}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("importExport")}</Label>
            <div className="flex gap-2">
              <input type="file" accept=".vcf" className="hidden" ref={fileInputRef} onChange={handleImport} />
              <Button onClick={() => fileInputRef.current?.click()}>
                <Import className="h-4 w-4 mr-2" />
                {t("import")}
              </Button>
              <Button onClick={handleExport}>
                <Export className="h-4 w-4 mr-2" />
                {t("export")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function useSettings() {
  const [settings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings")
      return saved ? JSON.parse(saved) : { showLastNameFirst: false }
    }
    return { showLastNameFirst: false }
  })

  return settings
}

