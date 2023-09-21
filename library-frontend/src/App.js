import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommendations from './components/Recommendations'
import { ALL_BOOKS, BOOK_ADDED } from './queries'

export const updateCache = (cache, query, addedBook) => {
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqByTitle(allBooks.concat(addedBook)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  const showWhenLogged = { display: token ? '' : 'none' }
  const hideWhenLogged = { display: token ? 'none' : '' }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)

      window.alert('New book added!')
    },
  })

  const handleLogOut = () => {
    setPage('authors')
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button style={showWhenLogged} onClick={() => setPage('add')}>
          add book
        </button>
        <button
          style={showWhenLogged}
          onClick={() => setPage('recommendations')}
        >
          recommendations
        </button>
        <button style={hideWhenLogged} onClick={() => setPage('login')}>
          login
        </button>
        <button style={showWhenLogged} onClick={handleLogOut}>
          logout
        </button>
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />

      <Recommendations show={page === 'recommendations'} />
    </div>
  )
}

export default App
