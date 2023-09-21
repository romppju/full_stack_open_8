import { useQuery } from '@apollo/client'
import { ALL_BOOKS, USER } from '../queries'
import BookInfo from './BookInfo'

const Recommendations = ({ show }) => {
  const bookResult = useQuery(ALL_BOOKS)
  const userResult = useQuery(USER)

  if (!show) {
    return null
  }

  if (bookResult.loading || userResult.loading) {
    return <div>loading...</div>
  }

  const user = userResult.data.me
  const books = bookResult.data.allBooks

  const favorite = user.favoriteGenre

  const booksToShow = books.filter((book) => book.genres.includes(favorite))

  return (
    <div>
      <h3>Recommendations</h3>
      <h4>Books in your favorite genre: {favorite}</h4>
      <BookInfo books={booksToShow} />
    </div>
  )
}

export default Recommendations
