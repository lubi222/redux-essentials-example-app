import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
} from '@reduxjs/toolkit'
import { client } from '../../api/client'

const usersAdapter = createEntityAdapter()

const initialState = usersAdapter.getInitialState()

// async action to get all users from our fake API
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get('/fakeApi/users')
  return response.data
})

const usersSlice = createSlice({
  name: 'users',
  initialState: usersAdapter.getInitialState(),
  reducers: {},
  extraReducers(builder) {
    // We replace the entire list of users with the array we fetched from the server
    builder.addCase(fetchUsers.fulfilled, usersAdapter.setAll)
  },
})

// export the action creators (to be used when dispatching actions)
export const {} = usersSlice.actions

// export the reducer (to be passed )
export default usersSlice.reducer

export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors((state) => state.users)
