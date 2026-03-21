import { memo } from 'react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <div className="footer-bar">
      Quan ly thiet bi {year}
    </div>
  )
}

export default memo(Footer)
