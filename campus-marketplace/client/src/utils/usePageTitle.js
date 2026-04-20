import { useEffect } from 'react'

const BASE = 'WSU Campus Marketplace'

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE}` : BASE
    return () => { document.title = BASE }
  }, [title])
}
