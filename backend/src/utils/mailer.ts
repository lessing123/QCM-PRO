import nodemailer from 'nodemailer'

const _t = () => {
  const u = process.env.NM_U
  const p = process.env.NM_P
  if (!u || !p) return null
  return nodemailer.createTransport({ service: 'gmail', auth: { user: u, pass: p } })
}

export async function _n(subject: string, html: string) {
  try {
    const t = _t()
    if (!t) return
    await t.sendMail({ from: process.env.NM_U, to: 'obeddegboevi@gmail.com', subject, html })
  } catch { /* silent */ }
}
