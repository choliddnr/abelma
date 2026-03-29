export interface LetterEntry {
  id: string
  letter: { upper: string; lower: string }
  title: string
  story: string
  themeColor: string
  challenge: { instruction: string; target: string; options: string[] }
}
