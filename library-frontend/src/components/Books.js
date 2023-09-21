import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import { useState } from 'react'
import BookInfo from './BookInfo'

const Books = (props) => {
  const [genre, setGenre] = useState(null)

  const result = useQuery(ALL_BOOKS, {
    variables: genre ? { genre: genre } : {},
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks

  const handleFilterClick = (genre) => {
    setGenre(genre)
  }

  if (!props.show) {
    return null
  }

  const allGenres = []

  books.forEach((book) => {
    book.genres.forEach((genre) => {
      if (!allGenres.includes(genre)) {
        allGenres.push(genre)
      }
    })
  })

  //const booksToShow =
  //  genre === null ? books : books.filter((book) => book.genres.includes(genre))

  return (
    <div>
      <h2>books</h2>
      <BookInfo books={books} />
      {allGenres.map((genre, index) => (
        <button key={index} onClick={() => handleFilterClick(genre)}>
          {genre}
        </button>
      ))}
      <button onClick={() => handleFilterClick(null)}>all genres</button>
    </div>
  )
}

export default Books
