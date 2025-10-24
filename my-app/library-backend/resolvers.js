const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()



const resolvers = {
  Query: {
    authorCount: async () => Author.collection.countDocuments(),
    bookCount: async () => Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      const author = await Author.findOne({ name: args.author })
      if (args.author && args.genre) {
        return Book.find({ author: author._id, genres: { $in: [args.genre] } }).populate('author')
      }
      if (args.author) {
        return Book.find({ author: author._id }).populate('author')
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } }).populate('author')
      }
      return Book.find({}).populate('author')
    },
    allAuthors: async () => {
      return Author.find({})
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({ author: root._id })
      return books.length
    }
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)
      return author
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
    const currentUser = context.currentUser

    if (!currentUser) {
      throw new GraphQLError('Not authenticated', {
        extensions: {
          code: 'BAD_USER_INPUT'
        }
      })
    }

    try {
      let author = await Author.findOne({ name: args.author })
      if (!author) author = new Author({ name: args.author })
      await author.save()
      const book = new Book({ ...args, author: author._id })
      await book.save()
      pubsub.publish('BOOK_ADDED', { bookAdded: book })
      return book
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
      })
    }
    },
    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name })
      author.born = args.setBornTo
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }
      
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Saving author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
        return user.save()
        .catch(error => {
          throw new GraphQLError('Creating user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWT_SECRET)
      return { value: token }
    }
  },
    Subscription: {
        bookAdded: {
        subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        }
    }
}

module.exports = resolvers