import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Opens a create modal when the URL contains ?new=1 (then removes the param). */
export function useOpenCreateFromQuery(openCreate: () => void) {
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('new') !== '1') return
    openCreate()
    const next = new URLSearchParams(searchParams)
    next.delete('new')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, openCreate])
}
