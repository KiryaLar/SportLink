import { Avatar, AvatarProps } from '@mui/material'

interface UserAvatarProps extends Omit<AvatarProps, 'src' | 'children'> {
  name?: string
  avatarUrl?: string
  size?: number
}

const COLORS = [
  '#4361EE',
  '#38BDF8',
  '#22C55E',
  '#F59E0B',
  '#EF4444',
  '#9333EA',
  '#DB2777',
  '#0891B2',
]

function getColorForName(name?: string): string {
  if (!name) return COLORS[0]
  const index = name.charCodeAt(0) % COLORS.length
  return COLORS[index]
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function UserAvatar({ name, avatarUrl, size = 40, sx, ...props }: UserAvatarProps) {
  const bgColor = getColorForName(name)
  const initials = getInitials(name)

  return (
    <Avatar
      src={avatarUrl}
      sx={{
        width: size,
        height: size,
        bgcolor: bgColor,
        fontSize: size * 0.38,
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    >
      {initials}
    </Avatar>
  )
}
