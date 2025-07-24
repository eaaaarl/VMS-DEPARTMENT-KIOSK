import { useGetAllDepartmentQuery } from '@/feature/department/api/deparmentApi';
import { Department } from '@/feature/department/api/interface';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { setDepartmentCameraEntry } from '@/lib/redux/state/departmentCameraEntrySlice';
import { setDepartmentManualEntry } from '@/lib/redux/state/departmentManualEntrySlice';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';

export const useUserDashboard = () => {
  // Redux
  const dispatch = useAppDispatch();
  const { ipAddress, port } = useAppSelector((state) => state.config);

  // State
  const [showDepartmentModal, setShowDepartmentModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // RTK Query
  const {
    data: departmentData,
    isLoading: isLoadingDepartmentData,
    isError: isErrorDepartmentData,
    refetch: refetchDepartmentData
  } = useGetAllDepartmentQuery();

  // Memos
  const checkingIfHaveDepartment = useMemo(() => {
    if (!selectedDepartment && !isLoadingDepartmentData && departmentData) {
      return false;
    }
    return true;
  }, [selectedDepartment, isLoadingDepartmentData, departmentData]);

  const checkingConfig = useMemo(() => {
    if (!ipAddress || ipAddress === '' || !port || port === 0) {
      return false;
    }
    return true;
  }, [ipAddress, port]);

  // Effects
  useEffect(() => {
    if (isNavigating) return;

    if (isErrorDepartmentData) {
      setIsNavigating(true);
      router.replace('/(error)/error-screen');
      return;
    }

    if (!checkingConfig) {
      setIsNavigating(true);
      router.replace('/(developer)/DeveloperSetting');
      return;
    }
  }, [isNavigating, isErrorDepartmentData, checkingConfig]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingIfHaveDepartment) {
      setShowDepartmentModal(true);
      return;
    }
  }, [checkingIfHaveDepartment, isNavigating]);

  // Handlers
  const handleCameraScan = useCallback(() => {
    if (!selectedDepartment) {
      Toast.show({
        type: 'error',
        text1: 'Department Selection Required',
        text2: 'Please select a department before proceeding',
      });
      return;
    }

    dispatch(setDepartmentCameraEntry(selectedDepartment));
    router.push('/(user)/CameraScreen');
  }, [selectedDepartment, dispatch]);

  const handleManualEntry = useCallback(() => {
    if (!selectedDepartment) {
      Toast.show({
        type: 'error',
        text1: 'Department Selection Required',
        text2: 'Please select a department before proceeding',
      });
      return;
    }

    dispatch(setDepartmentManualEntry(selectedDepartment));
    router.push('/(user)/ManualEntryScreen');
  }, [selectedDepartment, dispatch]);

  const handleDepartmentChange = useCallback(() => {
    setShowDepartmentModal(true);
    Toast.show({
      type: 'success',
      position: 'top',
      text1: 'Admin Access',
      text2: 'Department selection mode activated',
      visibilityTime: 2000,
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      await refetchDepartmentData();
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchDepartmentData]);

  return {
    // State
    showDepartmentModal,
    selectedDepartment,
    isNavigating,
    isRefreshing,
    isLoadingDepartmentData,
    departmentData,

    // Actions
    setShowDepartmentModal,
    setSelectedDepartment,
    handleCameraScan,
    handleManualEntry,
    handleDepartmentChange,
    handleRefresh,
  };
}; 