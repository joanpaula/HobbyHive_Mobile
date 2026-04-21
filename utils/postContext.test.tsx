import React from 'react';
import { Text, Button } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { PostProvider, usePosts } from './postContext';
import { createApiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  createApiClient: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
}));

jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    Snackbar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const expandMock = jest.fn();
  const closeMock = jest.fn();

  const BottomSheet = React.forwardRef((_props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      expand: expandMock,
      close: closeMock,
    }));
    return null;
  });

  const BottomSheetView = ({ children }: { children: React.ReactNode }) => <>{children}</>;

  return {
    __esModule: true,
    default: BottomSheet,
    BottomSheetView,
    __bottomSheetMocks: {
      expandMock,
      closeMock,
    },
  };
});

const getMock = jest.fn();
const putMock = jest.fn();
const postMock = jest.fn();

const { __bottomSheetMocks } = jest.requireMock('@gorhom/bottom-sheet');

function TestConsumer() {
  const {
    loading,
    posts,
    likePost,
    removePost,
    openComments,
    closeComments,
    comments,
    selectedPost,
    showGlobalSnackbar,
    snackbarVisible,
    snackbarMessage,
  } = usePosts();

  return (
    <>
      <Text testID="loading">{String(loading)}</Text>
      <Text testID="postCount">{String(posts.length)}</Text>
      <Text testID="firstLiked">
        {posts[0] ? String(posts[0].liked) : 'none'}
      </Text>
      <Text testID="firstLikesCount">
        {posts[0] ? String(posts[0].likes_count) : 'none'}
      </Text>
      <Text testID="commentCount">{String(comments.length)}</Text>
      <Text testID="selectedPostId">{selectedPost ? selectedPost._id : 'null'}</Text>
      <Text testID="snackbarVisible">{String(snackbarVisible)}</Text>
      <Text testID="snackbarMessage">{snackbarMessage || 'empty'}</Text>

      <Button title="like-first-post" onPress={() => likePost('1')} />
      <Button title="remove-first-post" onPress={() => removePost('1')} />
      <Button
        title="open-comments"
        onPress={() =>
          openComments({
            _id: '1',
            user_id: 'u1',
            username: 'joanpaula',
            body_text: 'hello',
            media_url: [],
            likes_count: 2,
            liked: false,
            comments_count: 0,
            hobby_tag: [],
            created_at: '2026-04-21',
          })
        }
      />
      <Button title="close-comments" onPress={() => closeComments()} />
      <Button title="show-snackbar" onPress={() => showGlobalSnackbar('Saved successfully')} />
    </>
  );
}

describe('PostProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (createApiClient as jest.Mock).mockImplementation((type: string) => {
      if (type === 'json') {
        return {
          get: getMock,
          put: putMock,
        };
      }

      if (type === 'form-data') {
        return {
          post: postMock,
        };
      }

      return {};
    });

    getMock.mockImplementation((url: string) => {
      if (url === '/api/v1.0/posts') {
        return Promise.resolve({
          data: [
            {
              _id: '1',
              user_id: 'u1',
              username: 'joanpaula',
              body_text: 'hello world',
              media_url: [],
              likes_count: 2,
              liked: false,
              comments_count: 0,
              hobby_tag: [],
              created_at: '2026-04-21',
            },
            {
              _id: '2',
              user_id: 'u2',
              username: 'anotheruser',
              body_text: 'second post',
              media_url: [],
              likes_count: 1,
              liked: false,
              comments_count: 0,
              hobby_tag: [],
              created_at: '2026-04-21',
            },
          ],
        });
      }

      if (url === '/api/v1.0/posts/1/comments') {
        return Promise.resolve({
          data: [
            {
              _id: 'c1',
              user_id: 'u9',
              username: 'commenter',
              post_id: '1',
              comment: 'Nice post',
              created_at: '2026-04-21',
            },
          ],
        });
      }

      return Promise.resolve({ data: [] });
    });

    putMock.mockResolvedValue({
      data: {
        liked: true,
        likes_count: 3,
      },
    });

    postMock.mockResolvedValue({
      data: {
        _id: 'new-comment',
        user_id: 'u9',
        username: 'commenter',
        post_id: '1',
        comment: 'Nice post',
        created_at: '2026-04-21',
      },
    });
  });

  it('loads posts on mount', async () => {
    const { getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('loading').props.children).toBe('false');
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1.0/posts');
    expect(getByTestId('postCount').props.children).toBe('2');
  });

  it('likePost updates the liked state and likes count', async () => {
    const { getByText, getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('2');
    });

    await act(async () => {
      fireEvent.press(getByText('like-first-post'));
    });

    await waitFor(() => {
      expect(getByTestId('firstLiked').props.children).toBe('true');
      expect(getByTestId('firstLikesCount').props.children).toBe('3');
    });

    expect(putMock).toHaveBeenCalledWith('/api/v1.0/posts/1/like', {});
  });

  it('removePost removes a post from state', async () => {
    const { getByText, getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('2');
    });

    fireEvent.press(getByText('remove-first-post'));

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('1');
    });
  });

  it('openComments fetches comments, sets selectedPost, and expands the bottom sheet', async () => {
    const { getByText, getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('2');
    });

    await act(async () => {
      fireEvent.press(getByText('open-comments'));
    });

    await waitFor(() => {
      expect(getByTestId('selectedPostId').props.children).toBe('1');
      expect(getByTestId('commentCount').props.children).toBe('1');
    });

    expect(getMock).toHaveBeenCalledWith('/api/v1.0/posts/1/comments');
    expect(__bottomSheetMocks.expandMock).toHaveBeenCalled();
  });

  it('closeComments clears selectedPost and comments and closes the bottom sheet', async () => {
    const { getByText, getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('2');
    });

    await act(async () => {
      fireEvent.press(getByText('open-comments'));
    });

    await waitFor(() => {
      expect(getByTestId('selectedPostId').props.children).toBe('1');
      expect(getByTestId('commentCount').props.children).toBe('1');
    });

    await act(async () => {
      fireEvent.press(getByText('close-comments'));
    });

    await waitFor(() => {
      expect(getByTestId('selectedPostId').props.children).toBe('null');
      expect(getByTestId('commentCount').props.children).toBe('0');
    });

    expect(__bottomSheetMocks.closeMock).toHaveBeenCalled();
  });

  it('showGlobalSnackbar updates the snackbar state and message', async () => {
    const { getByText, getByTestId } = render(
      <PostProvider>
        <TestConsumer />
      </PostProvider>
    );

    await waitFor(() => {
      expect(getByTestId('postCount').props.children).toBe('2');
    });

    fireEvent.press(getByText('show-snackbar'));

    await waitFor(() => {
      expect(getByTestId('snackbarVisible').props.children).toBe('true');
      expect(getByTestId('snackbarMessage').props.children).toBe('Saved successfully');
    });
  });
});