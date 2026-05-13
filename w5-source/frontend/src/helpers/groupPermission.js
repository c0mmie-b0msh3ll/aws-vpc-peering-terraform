export const groupPermission = ({ permissions, prefix }) => {
  const groups = {}
  permissions.forEach((p) => {
    const parts = p.permissionCode.split('.')
    let groupKey
    if (parts.length > 3) {
      groupKey = parts.slice(0, 3).join('.')
    } else {
      groupKey = parts.slice(0, 2).join('.')
    }
    const label = groupKey
      .replace(prefix, '')
      .split('.')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' › ')
    if (!groups[label]) groups[label] = []
    groups[label].push(p)
  })

  return groups
}
