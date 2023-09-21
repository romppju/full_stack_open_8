import { useMutation } from '@apollo/client'
import { useEffect, useState } from 'react'
import { LOGIN } from '../queries'

const LoginForm = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN)

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('libraryToken', token)
    }
  }, [result.data]) // eslint-disable-line

  if (!show) {
    return null
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
    setPage('authors')
  }

  return (
    <form onSubmit={handleLogin}>
      <div>
        username
        <input
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        ></input>
      </div>
      <div>
        password
        <input
          value={password}
          type="password"
          onChange={({ target }) => setPassword(target.value)}
        ></input>
      </div>
      <button type="submit">login</button>
    </form>
  )
}

export default LoginForm
