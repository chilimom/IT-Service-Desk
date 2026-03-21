export const generateRange = (start, end) => {
  const length = end + 1 - start
  return Array.from({ length }, (_, index) => start + index)
}

export const validate = (payload, setInvalidFields) => {
  let invalids = 0
  const formatPayload = Object.entries(payload)
  for (let arr of formatPayload) {
    if (arr[1].trim() === '') {
      invalids++
      setInvalidFields((prev) => [...prev, { name: arr[0], mess: 'Vui lòng nhập thông tin' }])
    }
  }

  for (let arr of formatPayload) {
    switch (arr[0]) {
      case 'password':
        if (arr[1].length < 1) {
          invalids++
          setInvalidFields((prev) => [
            ...prev,
            {
              name: arr[0],
              mess: 'Mật khẩu ít nhất 6 kí tự !',
            },
          ])
        }
        break

      default:
        break
    }
  }

  return invalids
}
