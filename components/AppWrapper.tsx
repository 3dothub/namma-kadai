import React from 'react';
import { View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { hideSnackbar } from '../store/slices/snackbarSlice';
import { Snackbar } from './Snackbar';

interface AppWrapperProps {
  children: React.ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { visible, message, type } = useSelector((state: RootState) => state.snackbar);

  const handleHide = () => {
    dispatch(hideSnackbar());
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Snackbar
        visible={visible}
        message={message}
        type={type || 'info' as any}
        onHide={handleHide}
      />
    </View>
  );
};

export default AppWrapper;
