import { useState } from 'react'
import { addWordEntry, type WordEntryMeaningInput } from '@/db/services/wordEntry.service'
import { useUIStore } from '@/stores/ui.store'
import type { Category } from '@/db/types'

export interface MeaningRowState {
  id: string
  text: string
  categories: Category[]
  firstUseDate: string
}

function createEmptyRow(): MeaningRowState {
  return {
    id: crypto.randomUUID(),
    text: '',
    categories: [],
    firstUseDate: new Date().toISOString().slice(0, 10),
  }
}

export function useAddEntry() {
  const setAddWordSheetOpen = useUIStore((s) => s.setAddWordSheetOpen)
  const setIosInstallPromptSeen = useUIStore((s) => s.setIosInstallPromptSeen)

  const [wordForm, setWordForm] = useState('')
  const [meaningRows, setMeaningRows] = useState<MeaningRowState[]>([createEmptyRow()])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addMeaningRow() {
    setMeaningRows((prev) => [...prev, createEmptyRow()])
  }

  function updateMeaningRow(id: string, partial: Partial<MeaningRowState>) {
    setMeaningRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...partial } : row))
    )
  }

  function reset() {
    setWordForm('')
    setMeaningRows([createEmptyRow()])
    setError(null)
  }

  async function handleSave() {
    setIsLoading(true)
    setError(null)
    try {
      const meanings: WordEntryMeaningInput[] = meaningRows.map((row) => ({
        text: row.text,
        categories: row.categories,
        firstUseDate: row.firstUseDate,
      }))
      await addWordEntry({ wordForm, meanings })
      setIosInstallPromptSeen(true)
      setAddWordSheetOpen(false)
      reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    wordForm,
    setWordForm,
    meaningRows,
    addMeaningRow,
    updateMeaningRow,
    handleSave,
    isLoading,
    error,
    reset,
  }
}
