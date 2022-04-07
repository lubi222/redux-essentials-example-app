import {
  createSlice,
  createAsyncThunk,
  createSelector,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

const postsAdapter = createEntityAdapter({
  // comparer used to keep entries in sorted order
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const res = await client.get('/fakeApi/posts')
  return res.data
})

// The payload creator receives the partial `{title, content, user}` object
export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async (initialPost) => {
    // send the initial data to the fake API server
    const res = await client.post('/fakeApi/posts', initialPost)
    // response includes the complete post object, including unique ID
    return res.data
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postUpdated(state, action) {
      const { id, title, content } = action.payload
      // thanks to our entity adapter we can now find in O(1) time [state.entities lookup table]
      const existingPost = state.entities[id]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action) {
      const { postId, reaction } = action.payload
      const existingPost = state.entities[postId]
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  // we need to listen for actions dispatched by our fetchPosts async thunk(not part of postsSlice normally)
  extraReducers(builder) {
    builder
      // action sent when request starts
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // Add any fetched posts to the array
        postsAdapter.upsertMany(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })

    // here we can directy use addOne as it has the same form as expected callback
    // (state, action) => ...
    builder.addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },
})

// export the action creators (to be used when dispatching actions)
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

// export the reducer (to be passed )
export default postsSlice.reducer

// selector functions - used so we don't have to rewrite logic in
// every component that needs access to a piece of the state
// export const selectAllPosts = (state) => state.posts.posts

// export const selectPostById = (state, postId) =>
//   state.posts.posts.find((post) => post.id === postId)

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state) => state.posts)

export const selectPostsByUser = createSelector(
  // Array of input selector functions
  // for each input, extract from it what we need
  // first input: state => reuse selectAllPosts as it takes in state
  // second input: userId => just return it using a simple selector
  [selectAllPosts, (state, userId) => userId],
  // Whatever they return is passed into the output selector function below
  // Here we reuse selectAllPosts to extract all posts from state
  // and a simple selector to extract the userId
  (posts, userId) => posts.filter((post) => post.user === userId)
)
