import React, { useCallback } from 'react'
import ContextChildren from './ContextChildren'

export interface MainContextData {
  onPost: (data: string) => void
}

export const MainContext = React.createContext<MainContextData | undefined>(undefined)

const ContextMain = () => {

  const onPost = useCallback((data: string) => {
    console.log('on post', data)
  }, [])

  return (
    <div>
      <MainContext.Provider value={{ onPost }}>
        <ContextChildren/>
      </MainContext.Provider>
    </div>
  )
}

export default ContextMain