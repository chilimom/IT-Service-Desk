function escapeExcelValue(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildExcelHtml(columns, rows) {
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8" />
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 12px; }
          th, td { border: 1px solid #9fb6ce; padding: 8px 10px; vertical-align: middle; line-height: 1.4; }
          th { background: #dbe9f8; color: #12385f; font-weight: 700; text-align: center; }
          .text-left { text-align: left; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        <table>
          <colgroup>
            ${columns.map((column) => `<col style="width:${column.width}px" />`).join('')}
          </colgroup>
          <thead>
            <tr>${columns.map((column) => `<th>${escapeExcelValue(column.header)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) =>
                  `<tr>${row
                    .map((cell, index) => `<td class="text-${columns[index].align}">${escapeExcelValue(cell)}</td>`)
                    .join('')}</tr>`,
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `
}

export function downloadExcelTable({ columns, rows, fileName }) {
  const html = buildExcelHtml(columns, rows)
  const blob = new Blob([`\uFEFF${html}`], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
