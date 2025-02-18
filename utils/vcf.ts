import quotedPrintable from "quoted-printable"
import { v4 as uuidv4 } from "uuid"

const decode = typeof quotedPrintable.decode === "function" ? quotedPrintable.decode : (str: string) => str

function decodeUTF8(str: string): string {
  try {
    return decodeURIComponent(escape(str))
  } catch (e) {
    return str
  }
}

function decodeQuotedPrintable(str: string): string {
  try {
    // Handle line continuations first
    str = str.replace(/=\r?\n/g, "")

    // Then decode quoted-printable
    const decoded = decode(str)
    return decodeUTF8(decoded)
  } catch (e) {
    try {
      // Manual decoding as fallback
      return str
        .replace(/=\r?\n/g, "")
        .split("=")
        .filter(Boolean)
        .map((hex) => String.fromCharCode(Number.parseInt(hex, 16)))
        .join("")
    } catch (err) {
      return str
    }
  }
}

function joinContinuationLines(lines: string[]): string[] {
  const joined: string[] = []
  let currentLine = ""

  for (const line of lines) {
    if (line.endsWith("=")) {
      currentLine += line.slice(0, -1)
    } else {
      joined.push(currentLine + line)
      currentLine = ""
    }
  }

  if (currentLine) {
    joined.push(currentLine)
  }

  return joined
}

function decodeVCardValue(value: string): string {
  if (!value) return ""

  // Try different decoding methods
  const decodings = [
    () => decodeUTF8(value),
    () => decodeQuotedPrintable(value),
    () => Buffer.from(value, "binary").toString("utf8"),
    () => value, // fallback to original
  ]

  for (const decode of decodings) {
    try {
      const decoded = decode()
      if (decoded && decoded !== value) {
        return decoded
      }
    } catch (e) {
      continue
    }
  }

  return value
}

export function generateVCard(contact: {
  firstName: string
  lastName: string
  phoneNumbers: Array<{ type: string; number: string }>
  email?: string
  birthDate?: string
  address?: string
  image?: string
}) {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N;CHARSET=UTF-8:${contact.lastName};${contact.firstName};;;`,
    `FN;CHARSET=UTF-8:${contact.firstName} ${contact.lastName}`,
  ]

  contact.phoneNumbers.forEach((phone) => {
    vcard.push(`TEL;TYPE=CELL:${phone.number}`)
  })

  if (contact.email) {
    vcard.push(`EMAIL:${contact.email}`)
  }

  if (contact.birthDate) {
    vcard.push(`BDAY:${contact.birthDate.replace(/\//g, "")}`)
  }

  if (contact.address) {
    vcard.push(`ADR;CHARSET=UTF-8:;;${contact.address};;;;`)
  }

  if (contact.image) {
    const base64Image = contact.image.split(",")[1]
    vcard.push(`PHOTO;ENCODING=b;TYPE=JPEG:${base64Image}`)
  }

  vcard.push("END:VCARD")
  return vcard.join("\n")
}

export function parseVCard(vcard: string) {
  const contacts = []
  const vcards = vcard.split("BEGIN:VCARD")

  for (const vc of vcards) {
    if (!vc.trim()) continue

    // Join continuation lines first
    const lines = joinContinuationLines(vc.split(/\r?\n/))
    const contact: any = {
      id: uuidv4(), // Generate a unique ID using UUID
      firstName: "",
      lastName: "",
      phoneNumbers: [],
      image: null,
    }

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      if (line.startsWith("N")) {
        try {
          const [field, value] = line.split(":", 2)
          if (value) {
            const decodedValue = field.includes("QUOTED-PRINTABLE") ? decodeQuotedPrintable(value) : decodeUTF8(value)

            const [lastName, firstName] = decodedValue.split(";")
            contact.lastName = lastName?.trim() || ""
            contact.firstName = firstName?.trim() || ""
          }
        } catch (e) {
          console.error("Error parsing name:", e)
        }
      } else if (line.startsWith("FN")) {
        try {
          const [field, value] = line.split(":", 2)
          if (value) {
            const decodedValue = field.includes("QUOTED-PRINTABLE") ? decodeQuotedPrintable(value) : decodeUTF8(value)

            if (!contact.firstName && !contact.lastName) {
              const parts = decodedValue.split(" ")
              contact.firstName = parts[0] || ""
              contact.lastName = parts.slice(1).join(" ") || ""
            }
          }
        } catch (e) {
          console.error("Error parsing full name:", e)
        }
      } else if (line.startsWith("TEL")) {
        const number = line.split(":")[1]?.trim()
        if (number) {
          contact.phoneNumbers.push({ type: "mobile", number })
        }
      } else if (line.startsWith("PHOTO")) {
        try {
          // Handle multi-line BASE64 photos
          const photoLines = []
          let isCollectingPhoto = true
          let i = lines.indexOf(line)

          while (isCollectingPhoto && i < lines.length) {
            const currentLine = lines[i].trim()
            if (currentLine.startsWith("PHOTO") || currentLine.match(/^[A-Za-z0-9+/=]+$/)) {
              if (currentLine.includes("BASE64")) {
                const base64 = currentLine.split(":")[1]?.trim()
                if (base64) photoLines.push(base64)
              } else {
                photoLines.push(currentLine)
              }
              i++
            } else {
              isCollectingPhoto = false
            }
          }

          const base64 = photoLines.join("")
          if (base64) {
            contact.image = `data:image/jpeg;base64,${base64}`
          }
        } catch (e) {
          console.error("Error parsing photo:", e)
        }
      }
    }

    if (contact.firstName || contact.lastName) {
      contacts.push(contact)
    }
  }

  return contacts
}

export function exportContacts(contacts: any[]) {
  const vcards = contacts.map(generateVCard).join("\n")
  const blob = new Blob([vcards], { type: "text/vcard;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "contacts.vcf"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function importContacts(file: File) {
  const text = await file.text()
  return parseVCard(text)
}

