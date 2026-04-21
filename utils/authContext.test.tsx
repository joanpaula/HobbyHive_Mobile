import React, { useContext } from 'react';
import { Button, Text } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { jwtDecode } from 'jwt-decode';
import { createApiClient } from '@/services/apiClient';
import { AuthContext, AuthProvider } from './authContext';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

jest.mock('@/services/apiClient', () => ({
  createApiClient: jest.fn(),
}));

const replaceMock = jest.fn();
const getMock = jest.fn();

function TestConsumer() {
  const auth = useContext(AuthContext);

  return (
    <>
      <Text testID="ready">{String(auth.isReady)}</Text>
      <Text testID="loggedIn">{String(auth.isLoggedIn)}</Text>
      <Text testID="user">{auth.user ? auth.user.username : 'null'}</Text>

      <Button title="login" onPress={() => auth.logIn('fake-token')} />
      <Button title="logout" onPress={() => auth.logOut()} />
    </>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });

    (createApiClient as jest.Mock).mockReturnValue({
      get: getMock,
    });

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    getMock.mockResolvedValue(undefined);
  });

  it('loads with no token', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null) // auth_token
      .mockResolvedValueOnce(null); // user_info

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('ready').props.children).toBe('true');
    });

    expect(getByTestId('loggedIn').props.children).toBe('false');
    expect(getByTestId('user').props.children).toBe('null');
    expect(getMock).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('loads stored token and stored user from AsyncStorage', async () => {
    const storedUser = {
      _id: '1',
      name: 'Joan Paula',
      username: 'joanpaula',
      password: null,
      email: 'joanpaula@example.com',
      created_at: '2026-04-21',
    };

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('stored-token')
      .mockResolvedValueOnce(JSON.stringify(storedUser));

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('ready').props.children).toBe('true');
    });

    expect(getByTestId('loggedIn').props.children).toBe('true');
    expect(getByTestId('user').props.children).toBe('joanpaula');
    expect(getMock).not.toHaveBeenCalled();
  });

  it('fetches the user when token exists but stored user does not', async () => {
    const apiUser = {
      _id: '1',
      name: 'Joan Paula',
      username: 'joanpaula',
      password: null,
      email: 'joanpaula@example.com',
      created_at: '2026-04-21',
    };

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce('stored-token')
      .mockResolvedValueOnce(null);

    (jwtDecode as jest.Mock).mockReturnValue({
      sub: '1',
      user: 'joanpaula',
      admin: false,
      exp: 9999999999,
    });

    getMock.mockResolvedValue({
      status: true,
      data: apiUser,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user').props.children).toBe('joanpaula');
    });

    expect(jwtDecode).toHaveBeenCalledWith('stored-token');
    expect(getMock).toHaveBeenCalledWith('/api/v1.0/users/1');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user_info',
      JSON.stringify(apiUser)
    );
  });

  it('logs in, stores token, fetches user, stores user, and redirects', async () => {
    const apiUser = {
      _id: '1',
      name: 'Joan Paula',
      username: 'joanpaula',
      password: null,
      email: 'joanpaula@example.com',
      created_at: '2026-04-21',
    };

    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    (jwtDecode as jest.Mock).mockReturnValue({
      sub: '1',
      user: 'joanpaula',
      admin: false,
      exp: 9999999999,
    });

    getMock.mockResolvedValue({
      status: true,
      data: apiUser,
    });

    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(getByText('login'));
    });

    await waitFor(() => {
      expect(getByTestId('loggedIn').props.children).toBe('true');
      expect(getByTestId('user').props.children).toBe('joanpaula');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'fake-token');
    expect(jwtDecode).toHaveBeenCalledWith('fake-token');
    expect(jwtDecode).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith('/api/v1.0/users/1');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user_info',
      JSON.stringify(apiUser)
    );
    expect(replaceMock).toHaveBeenCalledWith('/(protected)/(tabs)');
  });

  it('logs out, clears storage, resets state, and redirects', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('ready').props.children).toBe('true');
    });

    await act(async () => {
      fireEvent.press(getByText('logout'));
    });

    await waitFor(() => {
      expect(getByTestId('loggedIn').props.children).toBe('false');
      expect(getByTestId('user').props.children).toBe('null');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user_info');
      expect(replaceMock).toHaveBeenCalledWith('/auth/login');
    });
  });
});