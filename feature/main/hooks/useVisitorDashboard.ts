import { useGetAllDepartmentQuery } from "@/feature/department/api/deparmentApi";
import { Department } from "@/feature/department/api/interface";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setVisitorDepartmentEntry } from "@/lib/redux/state/visitorDepartmentEntry";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import Toast from "react-native-toast-message";

export const useVisitorDashboard = () => {
  const dispatch = useAppDispatch();
  const { ipAddress, port } = useAppSelector((state) => state.config);
  const { LayoutMode } = useAppSelector((state) => state.mode);

  const [isNavigating, setIsNavigating] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState<Department | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: departmentData,
    isLoading: isLoadingDepartment,
    isError,
    refetch,
  } = useGetAllDepartmentQuery();

  const checkingConfig = useMemo(() => {
    if (!ipAddress || ipAddress === "" || !port || port === 0) {
      return false;
    }
    return true;
  }, [ipAddress, port]);

  const checkingIfHaveDepartment = useMemo(() => {
    if (!currentDepartment && !isLoadingDepartment && departmentData) {
      return false;
    }
    return true;
  }, [currentDepartment, isLoadingDepartment, departmentData]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingConfig) {
      setIsNavigating(true);
      router.replace("/(developer)/DeveloperSetting");
      return;
    }

    if (isError) {
      setIsNavigating(true);

      if (!checkingConfig) {
        router.replace("/(developer)/DeveloperSetting");
      } else {
        router.replace("/(error)/error-screen");
      }

      return;
    }

    if (LayoutMode === null) {
      setIsNavigating(true);
      router.replace("/(mode)");
      return;
    }
  }, [checkingConfig, LayoutMode, isError, isNavigating]);

  useEffect(() => {
    if (isNavigating) return;

    if (!checkingIfHaveDepartment) {
      setShowDepartmentModal(true);
      return;
    }
  }, [checkingIfHaveDepartment, isNavigating]);

  const handleDepartmentChange = useCallback(() => {
    setShowDepartmentModal(true);
    Toast.show({
      type: "success",
      position: "top",
      text1: "Admin Access",
      text2: "Department selection mode activated",
      visibilityTime: 2000,
    });
  }, []);

  const handleDepartmentSelect = useCallback((dept: Department) => {
    setCurrentDepartment((prev) => {
      if (prev && prev.id === dept.id) {
        return null;
      }
      return dept;
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.log(error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleQRScan = useCallback(() => {
    if (!currentDepartment) {
      setShowDepartmentModal(true);
      return;
    }
    dispatch(setVisitorDepartmentEntry(currentDepartment));
    router.push("/(visitor)/VisitorCameraScreen");
  }, [currentDepartment, dispatch]);

  return {
    isNavigating,
    isLoadingDepartment,
    showDepartmentModal,
    setShowDepartmentModal,
    currentDepartment,
    isRefreshing,
    departmentData,
    handleDepartmentChange,
    handleDepartmentSelect,
    handleRefresh,
    handleQRScan,
  };
};
