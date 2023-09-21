import { useState } from 'react'
import { ALL_BOOKS, ALL_AUTHORS, UPDATE_AUTHOR } from '../queries'
import { useMutation } from '@apollo/client'
import Select from 'react-select'

const BirthYearForm = ({ authors }) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }],
  })

  const options = authors.map((a) => ({ value: a.name, label: a.name }))

  const submit = async (event) => {
    event.preventDefault()

    updateAuthor({ variables: { name: name.value, setBornTo: Number(born) } })

    setName('')
    setBorn('')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <Select defaultValue={name} onChange={setName} options={options} />
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          ></input>
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

export default BirthYearForm
