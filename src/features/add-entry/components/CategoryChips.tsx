import { useTranslation } from 'react-i18next'
import { CATEGORIES } from '@/db/schema'
import { Badge } from '@/components/ui/badge'

interface CategoryChipsProps {
  value: string[]
  onChange: (categories: string[]) => void
}

export function CategoryChips({ value, onChange }: CategoryChipsProps) {
  const { t } = useTranslation('common')

  function toggleCategory(cat: string) {
    if (value.includes(cat)) {
      onChange(value.filter((c) => c !== cat))
    } else {
      onChange([...value, cat])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">
        {t('addWord.categoriesLabel')}
      </label>
      <div className="overflow-x-auto -mx-1 px-1">
        <div className="flex gap-2 flex-nowrap pb-1">
          {CATEGORIES.map((cat) => (
            <Badge
              key={cat}
              variant={value.includes(cat) ? 'default' : 'outline'}
              className="cursor-pointer flex-shrink-0 select-none"
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
