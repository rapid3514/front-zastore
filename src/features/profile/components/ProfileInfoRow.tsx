import type { ReactNode } from 'react'

interface ProfileInfoRowProps {
  label: string
  value: ReactNode
}

export function ProfileInfoRow({ label, value }: ProfileInfoRowProps) {
  return <div className="profile-info-row"><dt>{label}</dt><dd>{value}</dd></div>
}
