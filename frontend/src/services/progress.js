async function readJson(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

export async function getProgress() {
  const response = await fetch('/api/progress')
  const data = await readJson(response)

  if (!response.ok) {
    throw new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : 'Không thể tải tiến độ',
    )
  }

  return data
}
