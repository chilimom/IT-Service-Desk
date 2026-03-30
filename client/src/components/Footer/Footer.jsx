import { memo } from 'react'

const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <div className="footer-bar">
      Copyright © {year} - IT Service Desk
    </div>
  )
}

export default memo(Footer)
