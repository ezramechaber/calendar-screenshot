'use client'

import { Switch as HeadlessSwitch } from '@headlessui/react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Switch({ checked, onChange }: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={`${
        checked ? 'bg-gray-900' : 'bg-gray-200'
      } relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
    >
      <span
        className={`${
          checked ? 'translate-x-5' : 'translate-x-1'
        } inline-block h-3 w-3 transform rounded-full bg-white transition-transform`}
      />
    </HeadlessSwitch>
  )
} 