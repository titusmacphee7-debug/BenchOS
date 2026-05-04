import type { StatusTone } from '../../data/mock/types'

export function readinessTone(status: string): StatusTone {
  if (status === 'Buildable Now') return 'green'
  if (status === 'Almost Buildable') return 'yellow'
  if (status === 'Missing Tools' || status === 'Missing Materials') return 'red'
  if (status === 'Blocked') return 'purple'
  return 'muted'
}

export function conditionTone(condition: string): StatusTone {
  if (condition === 'Good' || condition === 'New') return 'green'
  if (condition === 'Used') return 'blue'
  if (condition === 'Fair') return 'yellow'
  if (condition === 'Needs Repair' || condition === 'Broken') return 'red'
  return 'muted'
}

export function stockTone(status: string): StatusTone {
  if (status === 'In Stock') return 'green'
  if (status === 'Low' || status === 'Reorder Soon') return 'yellow'
  if (status === 'Out') return 'red'
  return 'muted'
}

export function priorityTone(priority: string): StatusTone {
  if (priority === 'High') return 'red'
  if (priority === 'Medium') return 'yellow'
  if (priority === 'Low') return 'green'
  return 'muted'
}

export function usageTone(level: string): StatusTone {
  if (level === 'High') return 'orange'
  if (level === 'Medium') return 'yellow'
  if (level === 'Low') return 'green'
  return 'muted'
}
