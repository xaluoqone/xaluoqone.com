import { MainContext } from './ContextMain'
import { useContext } from 'react'

const ContextChildren = () => {
  const mainContextData = useContext(MainContext)
  return (
    <div>
      <button onClick={() => {
        mainContextData && mainContextData?.onPost('ContextChildren Post!')
      }}>调用onPost
      </button>
    </div>
  )
}

export default ContextChildren