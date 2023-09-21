const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const Book = require('./models/Book')
const Author = require('./models/Author')
const User = require('./models/User')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let bookList = await Book.find({}).populate('author')

      if (args.author) {
        bookList = bookList.filter((book) => book.author.name === args.author)
      }

      if (args.genre) {
        bookList = bookList.filter((book) => book.genres.includes(args.genre))
      }

      return bookList
    },
    allAuthors: async () => {
      console.log('author find')

      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')

      const authorsWithCount = authors.map((author) => {
        return {
          name: author.name,
          born: author.born,
          id: author._id,
          bookCount: books.filter((book) => book.author.name === author.name)
            .length,
        }
      })
      return authorsWithCount
      //return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    },
  },
  /*
  Author: {
    bookCount: async (root) => {
      console.log('book find')
      const bookList = await Book.find({}).populate('author')
      return bookList.filter((book) => book.author.name === root.name).length
    },
  },
  */
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      if (!author) {
        author = new Author({ name: args.author, born: null, bookCount: 1 })
      } else {
        author.bookCount = author.bookCount + 1
      }

      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      const book = new Book({ ...args, author: author.id })

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      pubsub.publish('BOOK_ADDED', { bookAdded: book.populate('author') })
      return book.populate('author')
    },
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      try {
        author.born = args.setBornTo
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }

      return author
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })

      try {
        await user.save()
      } catch (error) {
        throw new GraphQLError('Creating user failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        })
      }
      return user
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT',
          },
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers
