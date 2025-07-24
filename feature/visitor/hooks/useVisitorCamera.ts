import { useAppSelector } from "@/lib/redux/hooks";
import { format, parse } from "date-fns";
import { BarcodeScanningResult, Camera } from "expo-camera";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  ICreateVisitorLogDetailPayload,
  ICreateVisitorLogPayload,
  IVisitorSignOutPayload,
  VisitorLog,
  VisitorLogDetail,
} from "../api/inteface";
import {
  useCreateVisitorLogDetailMutation,
  useCreateVisitorLogDuplicatePhotoMutation,
  useCreateVisitorLogMutation,
  useLazyVisitorImageQuery,
  useLazyVisitorLogInDetailInfoQuery,
  useLazyVisitorLogInfoQuery,
  useSignOutVisitorLogDetailMutation,
  useUpdateVisitorLogMutation,
  useUpdateVisitorsLogDetailMutation,
} from "../api/visitorApi";

export const MODAL_MESSAGES = {
  DIFFERENT_OFFICE: `You are not currently signed in to this department.\nWould you like to automatically sign out\nfrom your previous location?`,
};

export interface UseVisitorCameraReturn {
  // Camera states
  hasPermission: boolean | null;
  scanned: boolean;
  cameraEnabled: boolean;
  setCameraEnabled: (enabled: boolean) => void;

  // Modal states and data
  showVisitorInformationCheckingModal: boolean;
  showSignOutModal: boolean;
  showModal: boolean;
  modalMessage: string;
  currentVisitorLog: VisitorLog | null;
  currentVisitorLogInDetailSignOut: VisitorLogDetail | null;
  purpose: string;
  idVisitorImage: string | null;
  photoVisitorImage: string | null;

  // Loading states
  isLoading: boolean;

  // Handlers
  handleQrCodeScanned: (result: BarcodeScanningResult) => Promise<void>;
  handleChangePurpose: (purpose: string) => void;
  handleCloseVisitorInformationCheckingModal: () => void;
  handleSubmitVisitorLog: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleYesDifferentOffice: () => Promise<void>;
  handleCancelDifferentOffice: () => void;
  resetScanner: () => void;
}

export const useVisitorCamera = (): UseVisitorCameraReturn => {
  // Redux State
  const { VisitorDepartmentEntry } = useAppSelector(
    (state) => state.visitorDepartmentEntry
  );

  // Camera States
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // Visitor Information Modal States
  const [
    showVisitorInformationCheckingModal,
    setShowVisitorInformationCheckingModal,
  ] = useState(false);
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(
    null
  );
  const [
    currentVisitorLogInDetailSignOut,
    setCurrentVisitorLogInDetailSignOut,
  ] = useState<VisitorLogDetail | null>(null);
  const [purpose, setPurpose] = useState("");
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null);
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(
    null
  );
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [
    visitorDetailSignInDifferentOffice,
    setVisitorDetailSignInDifferentOffice,
  ] = useState<VisitorLogDetail | null>(null);
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] =
    useState<VisitorLog | null>(null);

  // API Queries
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();

  // Redux Mutations
  const [
    createVisitorLogDetail,
    { isLoading: isLoadingCreateVisitorLogDetail },
  ] = useCreateVisitorLogDetailMutation();
  const [
    updateVisitorsLogDetail,
    { isLoading: isLoadingUpdateVisitorsLogDetail },
  ] = useUpdateVisitorsLogDetailMutation();
  const [updateVisitorLog, { isLoading: isLoadingUpdateVisitorLog }] =
    useUpdateVisitorLogMutation();
  const [createVisitorLog, { isLoading: isLoadingCreateVisitorLog }] =
    useCreateVisitorLogMutation();
  const [signOutVisitor, { isLoading: isLoadingSignOutVisitor }] =
    useSignOutVisitorLogDetailMutation();
  const [
    createDuplicatePhotoVisitor,
    { isLoading: isLoadingCreateDuplicatePhotoVisitor },
  ] = useCreateVisitorLogDuplicatePhotoMutation();

  // Combined loading state
  const isLoading =
    isLoadingCreateVisitorLogDetail ||
    isLoadingUpdateVisitorsLogDetail ||
    isLoadingUpdateVisitorLog ||
    isLoadingCreateVisitorLog ||
    isLoadingSignOutVisitor ||
    isLoadingCreateDuplicatePhotoVisitor;

  // Initialize camera permissions
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();

    return () => {
      setCameraEnabled(false);
    };
  }, []);

  // Utility Functions
  const validatePurpose = useCallback((purposeText: string): boolean => {
    if (purposeText.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Please enter a purpose of the visit!",
      });
      return false;
    }
    return true;
  }, []);

  const checkVisitorData = useCallback((visitorData: any) => {
    if (visitorData?.results?.length === 0) {
      Toast.show({
        type: "error",
        text1: "ID Not in use!",
        text2: "Please check the ticket id",
      });
      return false;
    }
    return true;
  }, []);

  const checkVisitorLoggedOut = useCallback((visitorData: any) => {
    if (visitorData?.results?.[0]?.logOut !== null) {
      Toast.show({
        type: "error",
        text1: "ID Already Logged Out!",
      });
      return true;
    }
    return false;
  }, []);

  // Image Handling
  const fetchVisitorImages = useCallback(
    async (logInTime: string) => {
      try {
        const imageUrl =
          logInTime.replace(" ", "_").replace(/:/g, "-") + ".png";
        const imageData = await visitorImage({ fileName: imageUrl }).unwrap();

        if (imageData.idExist && imageData.photoExist) {
          setIdVisitorImage(`id_${imageUrl}`);
          setPhotoVisitorImage(`face_${imageUrl}`);
        } else {
          setIdVisitorImage(null);
          setPhotoVisitorImage(null);
        }
      } catch (error) {
        console.log("Error fetching images:", error);
        setIdVisitorImage(null);
        setPhotoVisitorImage(null);
      }
    },
    [visitorImage]
  );

  // Visitor Flow Handlers
  const handleSameOfficeVisitor = useCallback(
    async (visitorLogData: any) => {
      setShowVisitorInformationCheckingModal(true);
      setCurrentVisitorLog(visitorLogData.results[0]);
      await fetchVisitorImages(visitorLogData.results[0].strLogIn);
    },
    [fetchVisitorImages]
  );

  const handleDifferentOfficeVisitor = useCallback(
    (visitorLogData: any, visitorDetailData: any) => {
      setShowModal(true);
      setModalMessage(MODAL_MESSAGES.DIFFERENT_OFFICE);
      setVisitorDetailSignInDifferentOffice(visitorDetailData.results[0]);
      setVisitorLogSignInDifferentOffice(visitorLogData.results[0]);
    },
    []
  );

  const handleSignOutVisitor = useCallback((visitorDetailData: any) => {
    setShowSignOutModal(true);
    setCurrentVisitorLogInDetailSignOut(visitorDetailData.results[0]);
  }, []);

  // Office Transfer Handlers
  const signOutFromPreviousOffice = useCallback(
    async (visitorStrId: string, dateTimeLogin: string) => {
      await updateVisitorLog({
        id: visitorStrId,
        dateTime: dateTimeLogin,
        logOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        sysLogOut: true,
        returned: true,
      }).unwrap();
    },
    [updateVisitorLog]
  );

  const signOutFromDepartment = useCallback(
    async (visitorStrId: string, dateTimeDeptLogin: string) => {
      await updateVisitorsLogDetail({
        id: visitorStrId,
        dateTime: dateTimeDeptLogin,
        deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        userDeptLogOutId: null,
      }).unwrap();
    },
    [updateVisitorsLogDetail]
  );

  const duplicateVisitorPhoto = useCallback(
    async (originalLogIn: string, newLogIn: string) => {
      const fileName =
        originalLogIn.replace(" ", "_").replace(/:/g, "-") + ".png";
      const newfileName =
        newLogIn.replace(" ", "_").replace(/:/g, "-") + ".png";

      await createDuplicatePhotoVisitor({
        filename: fileName,
        newFilename: newfileName,
      });
    },
    [createDuplicatePhotoVisitor]
  );

  const signInToNewOffice = useCallback(
    async (visitorData: VisitorLog) => {
      const formattedDate = format(
        parse(visitorData.logDate, "MM/dd/yyyy", new Date()),
        "yyyy-MM-dd"
      );

      const signInPayload: ICreateVisitorLogPayload = {
        id: visitorData.id,
        strId: visitorData.strId,
        logIn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        logInDate: formattedDate,
        visitorId: visitorData.visitorId,
        officeId: Number(VisitorDepartmentEntry?.officeId),
        serviceId: visitorData.serviceId,
        returned: false,
        specService: visitorData.specService ?? "",
        userLogInId: 0,
      };

      await duplicateVisitorPhoto(visitorData.strLogIn, signInPayload.logIn);
      return await createVisitorLog(signInPayload).unwrap();
    },
    [VisitorDepartmentEntry?.officeId, duplicateVisitorPhoto, createVisitorLog]
  );

  // Main Action Handlers
  const handleChangePurpose = useCallback((newPurpose: string) => {
    setPurpose(newPurpose);
  }, []);

  const handleCloseVisitorInformationCheckingModal = useCallback(() => {
    setShowVisitorInformationCheckingModal(false);
    setCurrentVisitorLog(null);
    setIdVisitorImage(null);
    setPhotoVisitorImage(null);
    setPurpose("");
  }, []);

  const handleSubmitVisitorLog = useCallback(async () => {
    if (!validatePurpose(purpose)) return;

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: format(
              new Date(currentVisitorLog?.logIn || ""),
              "yyyy-MM-dd HH:mm:ss"
            ),
            deptLogIn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: VisitorDepartmentEntry?.id as number,
            reason: purpose,
            userDeptLogInId: null,
          },
        },
      };

      const response = await createVisitorLogDetail(payload).unwrap();
      Toast.show({
        type: "success",
        text1: response.ghMessage.toUpperCase(),
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 3000,
      });
      handleCloseVisitorInformationCheckingModal();
      setPurpose("");

      setTimeout(() => {
        setScanned(false);
        setCameraEnabled(true);
      }, 1000);
    } catch (error) {
      console.log("Error submitting visitor log:", error);
      Toast.show({
        type: "error",
        text1: "Failed to submit visitor log",
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 4000,
      });
    }
  }, [
    validatePurpose,
    currentVisitorLog,
    VisitorDepartmentEntry,
    createVisitorLogDetail,
    handleCloseVisitorInformationCheckingModal,
    purpose,
  ]);

  const handleSignOut = useCallback(async () => {
    if (
      !currentVisitorLogInDetailSignOut?.strId ||
      !currentVisitorLogInDetailSignOut?.strDeptLogIn
    ) {
      Toast.show({
        type: "error",
        text1: "No visitor log in detail found!",
        text2: "Please check the ticket id",
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const response = await updateVisitorsLogDetail({
        id: currentVisitorLogInDetailSignOut.strId,
        dateTime: currentVisitorLogInDetailSignOut.strDeptLogIn,
        deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        userDeptLogOutId: null,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: response.ghMessage.toUpperCase(),
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 3000,
      });
      setShowSignOutModal(false);
      setPurpose("");

      setTimeout(() => {
        setScanned(false);
        setCameraEnabled(true);
      }, 1000);
    } catch (error) {
      console.log("Sign out error:", error);
      Toast.show({
        type: "error",
        text1: "Sign Out Failed",
        text2: "Please try again or check your connection",
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 4000,
      });
    }
  }, [currentVisitorLogInDetailSignOut, updateVisitorsLogDetail]);

  const handleQrCodeScanned = useCallback(
    async ({ data: scannedTicket }: BarcodeScanningResult) => {
      try {
        setScanned(true);
        setCameraEnabled(false);

        const { data: visitorLog } = await visitorLogInfo({
          strId: scannedTicket,
        });
        const { data: visitorLogDetail } = await visitorLogInDetailInfo({
          strId: scannedTicket,
        });

        if (!checkVisitorData(visitorLog)) {
          setCameraEnabled(true);
          return;
        }
        if (checkVisitorLoggedOut(visitorLog)) {
          setCameraEnabled(true);
          return;
        }

        const sameOfficeVisitor =
          visitorLog?.results[0].officeId ===
          Number(VisitorDepartmentEntry?.officeId);
        const visitorNotLoggedOut =
          visitorLogDetail?.results?.length === 0 ||
          visitorLogDetail?.results?.[0]?.deptLogOut !== null;

        if (sameOfficeVisitor && visitorNotLoggedOut) {
          await handleSameOfficeVisitor(visitorLog);
          return;
        }

        const visitorISnotSameOfficeId =
          visitorLog?.results[0].officeId !==
          Number(VisitorDepartmentEntry?.officeId);
        if (visitorISnotSameOfficeId) {
          handleDifferentOfficeVisitor(visitorLog, visitorLogDetail);
          return;
        }

        handleSignOutVisitor(visitorLogDetail);
      } catch (error) {
        console.log("Error checking ticket:", error);
        Alert.alert("Error", "Failed to process ticket");
        setCameraEnabled(true);
      }
    },
    [
      checkVisitorData,
      checkVisitorLoggedOut,
      VisitorDepartmentEntry,
      handleSameOfficeVisitor,
      handleDifferentOfficeVisitor,
      handleSignOutVisitor,
      visitorLogInfo,
      visitorLogInDetailInfo,
    ]
  );

  const handleYesDifferentOffice = useCallback(async () => {
    try {
      if (visitorDetailSignInDifferentOffice) {
        if (visitorDetailSignInDifferentOffice.deptLogOut !== null) {
          // Visitor already logged out from department
          if (!visitorLogSignInDifferentOffice) return;

          await signOutFromPreviousOffice(
            visitorLogSignInDifferentOffice.strId,
            visitorLogSignInDifferentOffice.strLogIn
          );

          const response = await signInToNewOffice(
            visitorLogSignInDifferentOffice
          );

          if (response.ghMessage) {
            setShowModal(false);
            setPurpose("");
          }

          setShowVisitorInformationCheckingModal(true);
          setCurrentVisitorLog(visitorLogSignInDifferentOffice);
          await fetchVisitorImages(visitorLogSignInDifferentOffice.strLogIn);
        } else {
          // Visitor still logged in at previous office department
          if (
            !visitorDetailSignInDifferentOffice ||
            !visitorLogSignInDifferentOffice
          )
            return;

          await signOutFromDepartment(
            visitorDetailSignInDifferentOffice.strId,
            visitorDetailSignInDifferentOffice.strDeptLogIn
          );

          await signOutFromPreviousOffice(
            visitorDetailSignInDifferentOffice.strId,
            visitorLogSignInDifferentOffice.strLogIn
          );

          const response = await signInToNewOffice(
            visitorLogSignInDifferentOffice
          );

          if (response.ghMessage) {
            setShowModal(false);
            setPurpose("");
          }

          setShowVisitorInformationCheckingModal(true);
          setCurrentVisitorLog(visitorLogSignInDifferentOffice);
          await fetchVisitorImages(visitorLogSignInDifferentOffice.strLogIn);
        }
      } else {
        // Direct office-to-office transfer
        if (!visitorLogSignInDifferentOffice) return;

        const signOutPayloadDirect: IVisitorSignOutPayload = {
          deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          sysDeptLogOut: true,
        };

        await signOutVisitor({
          payload: signOutPayloadDirect,
          dateTime: visitorLogSignInDifferentOffice.strLogIn,
          strId: visitorLogSignInDifferentOffice.strId,
        });

        const response = await signInToNewOffice(
          visitorLogSignInDifferentOffice
        );

        if (response.ghMessage) {
          setShowModal(false);
          setPurpose("");
        }

        setShowVisitorInformationCheckingModal(true);
        setCurrentVisitorLog(visitorLogSignInDifferentOffice);
        await fetchVisitorImages(visitorLogSignInDifferentOffice.strLogIn);
      }

      setTimeout(() => {
        setScanned(false);
        setCameraEnabled(true);
      }, 1000);
    } catch (error) {
      console.log("Error handling different office visitor:", error);
      Toast.show({
        type: "error",
        text1: "Failed to transfer visitor",
        position: "bottom",
        bottomOffset: 100,
        visibilityTime: 4000,
      });
    }
  }, [
    visitorDetailSignInDifferentOffice,
    visitorLogSignInDifferentOffice,
    signOutFromPreviousOffice,
    signOutFromDepartment,
    signInToNewOffice,
    signOutVisitor,
    fetchVisitorImages,
  ]);

  const handleCancelDifferentOffice = useCallback(() => {
    setShowModal(false);
  }, []);

  const resetScanner = useCallback(() => {
    setScanned(false);
    setCameraEnabled(true);
  }, []);

  return {
    // Camera states
    hasPermission,
    scanned,
    cameraEnabled,
    setCameraEnabled,

    // Modal states and data
    showVisitorInformationCheckingModal,
    showSignOutModal,
    showModal,
    modalMessage,
    currentVisitorLog,
    currentVisitorLogInDetailSignOut,
    purpose,
    idVisitorImage,
    photoVisitorImage,

    // Loading state
    isLoading,

    // Handlers
    handleQrCodeScanned,
    handleChangePurpose,
    handleCloseVisitorInformationCheckingModal,
    handleSubmitVisitorLog,
    handleSignOut,
    handleYesDifferentOffice,
    handleCancelDifferentOffice,
    resetScanner,
  };
};
