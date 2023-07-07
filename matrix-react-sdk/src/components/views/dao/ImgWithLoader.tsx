import React, { useState } from 'react'
import Spinner from '../elements/Spinner'

const ImgWithLoader = (props) => {
  const [isLoading, setIsLoading] = useState(true)
  return (
    <div className="relative">
      {isLoading && (
        <Spinner/>
      )}
      <img {...props} onLoad={() => setIsLoading(false)} />
    </div>
  )
}

export default ImgWithLoader
