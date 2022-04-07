import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Spinner } from '../../components/Spinner'
import PostExcerpt from './PostExcerpt'

import { selectAllPosts, fetchPosts, selectPostIds } from './postsSlice'

export default function PostsList() {
  const dispatch = useDispatch()
  const orderedPostIds = useSelector(selectPostIds)
  // get posts from redux store
  const posts = useSelector(selectAllPosts)

  const postStatus = useSelector((state) => state.posts.status)
  const error = useSelector((state) => state.posts.error)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content

  if (postStatus === 'loading') {
    content = <Spinner text="Loading..."></Spinner>
  } else if (postStatus === 'succeeded') {
    content = orderedPostIds.map((postId) => (
      <PostExcerpt key={postId} postId={postId}></PostExcerpt>
    ))
  } else if (postStatus === 'failed') {
    content = <div>{error}</div>
  }

  return (
    <section>
      <h2>Posts</h2>
      {content}
    </section>
  )
}
