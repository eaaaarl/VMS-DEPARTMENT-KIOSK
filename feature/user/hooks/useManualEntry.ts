import {
  ICreateVisitorLogDetailPayload,
  ICreateVisitorLogPayload,
  IVisitorSignOutPayload,
  VisitorLog,
  VisitorLogDetail,
} from "@/feature/visitor/api/inteface";
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
} from "@/feature/visitor/api/visitorApi";
import { formattedDateWithTime } from "@/feature/visitor/utils/formattedDate";
import { useAppSelector } from "@/lib/redux/hooks";
import { format, parse } from "date-fns";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

// Constants
const ERROR_CODES = {
  VISITOR_ALREADY_LOGGED_OUT: 2001,
} as const;

const MODAL_MESSAGES = {
  DIFFERENT_OFFICE: `Visitor is not currently in the office premise of this department,\nDo you want to automatically sign out\ntheir previous office location?`,
  DIFFERENT_DEPARTMENT: `Visitor is in office premise but not in this department,\nDo you want to automatically sign out\ntheir previous department location?`,
} as const;

export const useManualEntry = () => {
  // Redux State
  const { departmentManualEntry } = useAppSelector(
    (state) => state.departmentManualEntry
  );

  // Form State
  const [ticketId, setTicketId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visitor State
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(
    null
  );
  const [
    currentVisitorLogInDetailSignOut,
    setCurrentVisitorLogInDetailSignOut,
  ] = useState<VisitorLogDetail | null>(null);
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null);
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(
    null
  );
  const [
    visitorDetailSignInDifferentOffice,
    setVisitorDetailSignInDifferentOffice,
  ] = useState<VisitorLogDetail | null>(null);
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] =
    useState<VisitorLog | null>(null);

  // Modal State
  const [
    showVisitorInformationCheckingModal,
    setShowVisitorInformationCheckingModal,
  ] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");

  // RTK Query Hooks
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();
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

  // Validation Functions
  const validateTicketId = useCallback((id: string): boolean => {
    if (id.trim() === "") {
      Alert.alert("Error", "Please enter a ticket ID");
      return false;
    }
    return true;
  }, []);

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

  // Toast Handlers
  const showErrorToast = useCallback((title: string, subtitle?: string) => {
    Toast.show({
      type: "error",
      text1: title,
      text2: subtitle,
      position: "bottom",
      bottomOffset: 100,
      visibilityTime: 4000,
    });
  }, []);

  const showSuccessToast = useCallback((title: string) => {
    Toast.show({
      type: "success",
      text1: title.toUpperCase(),
      position: "bottom",
      bottomOffset: 100,
      visibilityTime: 3000,
    });
  }, []);

  // Reset Functions
  const resetForm = useCallback(() => {
    setTicketId("");
    setPurpose("");
  }, []);

  const resetVisitorState = useCallback(() => {
    setCurrentVisitorLog(null);
    setCurrentVisitorLogInDetailSignOut(null);
    setIdVisitorImage(null);
    setPhotoVisitorImage(null);
    setVisitorDetailSignInDifferentOffice(null);
    setVisitorLogSignInDifferentOffice(null);
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

  // Visitor Status Checking
  const checkVisitorExists = useCallback((visitorData: any) => {
    if (visitorData?.results.length === 0) {
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
    if (visitorData?.results?.[0].logOut !== null) {
      Toast.show({
        type: "error",
        text1: "ID Already Logged Out!",
      });
      return true;
    }
    return false;
  }, []);

  // Event Handlers
  const handleChangePurpose = useCallback((purposeText: string) => {
    setPurpose(purposeText);
  }, []);

  const handleCloseVisitorInformationCheckingModal = useCallback(() => {
    setShowVisitorInformationCheckingModal(false);
    resetVisitorState();
  }, [resetVisitorState]);

  // Main Business Logic
  const handleSubmitVisitorLog = useCallback(async () => {
    if (!validatePurpose(purpose)) return;

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: formattedDateWithTime(
              new Date(currentVisitorLog?.logIn || "")
            ),
            deptLogIn: formattedDateWithTime(new Date()),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: departmentManualEntry?.id as number,
            reason: purpose,
            userDeptLogInId: null,
          },
        },
      };
      const response = await createVisitorLogDetail(payload).unwrap();
      showSuccessToast(response.ghMessage);
      handleCloseVisitorInformationCheckingModal();
      resetForm();
    } catch (error) {
      console.log("Error submitting visitor log:", error);
      showErrorToast("Failed to submit visitor log");
    }
  }, [
    purpose,
    currentVisitorLog,
    departmentManualEntry,
    validatePurpose,
    createVisitorLogDetail,
    showSuccessToast,
    handleCloseVisitorInformationCheckingModal,
    resetForm,
    showErrorToast,
  ]);

  const handleSignOut = useCallback(async () => {
    if (
      !currentVisitorLogInDetailSignOut?.strId ||
      !currentVisitorLogInDetailSignOut?.strDeptLogIn
    ) {
      showErrorToast(
        "No visitor log in detail found!",
        "Please check the ticket id"
      );
      return;
    }

    try {
      const dateTimeDeptLogin = currentVisitorLogInDetailSignOut.strDeptLogIn;
      const visitorStrId = currentVisitorLogInDetailSignOut.strId;

      const response = await updateVisitorsLogDetail({
        id: visitorStrId,
        dateTime: dateTimeDeptLogin,
        deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        userDeptLogOutId: null,
      }).unwrap();

      if (response.ghError === ERROR_CODES.VISITOR_ALREADY_LOGGED_OUT) {
        showErrorToast("Visitor Already Logged Out!");
        setShowSignOutModal(false);
        resetForm();
        return;
      }

      showSuccessToast(response.ghMessage);
      setShowSignOutModal(false);
      resetForm();
    } catch (error) {
      console.log("Sign out error:", error);
      showErrorToast(
        "Sign Out Failed",
        "Please try again or check your connection"
      );
    }
  }, [
    currentVisitorLogInDetailSignOut,
    updateVisitorsLogDetail,
    showErrorToast,
    showSuccessToast,
    resetForm,
  ]);

  const handleSameOfficeVisitor = useCallback(
    async (visitorLogData: any) => {
      setShowVisitorInformationCheckingModal(true);
      setCurrentVisitorLog(visitorLogData.results[0]);
      await fetchVisitorImages(visitorLogData.results[0].strLogIn);
    },
    [fetchVisitorImages]
  );

  const handleDifferentOfficeVisitorLog = useCallback(
    async (visitorLogData: VisitorLog) => {
      setShowVisitorInformationCheckingModal(true);
      setCurrentVisitorLog(visitorLogData);
      await fetchVisitorImages(visitorLogData.strLogIn);
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

  const handleTicketChecking = useCallback(async () => {
    if (!validateTicketId(ticketId)) return;
    setIsSubmitting(true);
    try {
      const visitorLogInfoData = await visitorLogInfo({
        strId: ticketId,
      }).unwrap();
      const visitorLogInDetailData = await visitorLogInDetailInfo({
        strId: ticketId,
      }).unwrap();

      if (!checkVisitorExists(visitorLogInfoData)) return;
      if (checkVisitorLoggedOut(visitorLogInfoData)) return;

      const sameOfficeVisitor =
        visitorLogInfoData.results[0].officeId ===
        Number(departmentManualEntry?.officeId);
      const visitorNotLoggedOut =
        visitorLogInDetailData?.results?.length === 0 ||
        visitorLogInDetailData?.results?.[0]?.deptLogOut !== null;

      if (sameOfficeVisitor && visitorNotLoggedOut) {
        await handleSameOfficeVisitor(visitorLogInfoData);
        return;
      }

      const visitorISnotSameOfficeId =
        visitorLogInfoData.results[0].officeId !==
        Number(departmentManualEntry?.officeId);
      if (visitorISnotSameOfficeId) {
        handleDifferentOfficeVisitor(
          visitorLogInfoData,
          visitorLogInDetailData
        );
        return;
      }

      handleSignOutVisitor(visitorLogInDetailData);
    } catch (error) {
      console.log("Error checking ticket:", error);
      Alert.alert("Error", "Failed to process ticket");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    ticketId,
    validateTicketId,
    visitorLogInfo,
    visitorLogInDetailInfo,
    checkVisitorExists,
    checkVisitorLoggedOut,
    departmentManualEntry,
    handleSameOfficeVisitor,
    handleDifferentOfficeVisitor,
    handleSignOutVisitor,
  ]);

  // Helper functions for handleYesDifferentOffice
  const createFileNames = useCallback((logInTime: string) => {
    const formattedTime = format(logInTime, "yyyy-MM-dd HH:mm:ss")
      .replace(" ", "_")
      .replace(/:/g, "-");
    return {
      fileName: `${formattedTime}.png`,
      newFileName: `${format(new Date(), "yyyy-MM-dd HH:mm:ss")
        .replace(" ", "_")
        .replace(/:/g, "-")}.png`,
    };
  }, []);

  const getFormattedLogDate = useCallback((logDateStr: string) => {
    const parsedDate = parse(logDateStr, "MM/dd/yyyy", new Date());
    return format(parsedDate, "yyyy-MM-dd");
  }, []);

  const createSignInPayload = useCallback(
    (visitorLog: any): ICreateVisitorLogPayload => {
      return {
        id: visitorLog?.id as number,
        strId: visitorLog?.strId as string,
        logIn: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        logInDate: getFormattedLogDate(visitorLog?.logDate as string),
        visitorId: visitorLog?.visitorId as number,
        officeId: Number(departmentManualEntry?.officeId),
        serviceId: visitorLog?.serviceId as number,
        returned: false,
        specService: (visitorLog?.specService as string) ?? "",
        userLogInId: 0,
      };
    },
    [departmentManualEntry?.officeId, getFormattedLogDate]
  );

  const handleSignOutAndSignIn = useCallback(
    async (visitorLog: any, signOutPayload: any) => {
      await updateVisitorLog({
        id: visitorLog.strId as string,
        dateTime: visitorLog.strLogIn || "",
        ...signOutPayload,
      }).unwrap();

      const signInPayload = createSignInPayload(visitorLog);
      const { fileName, newFileName } = createFileNames(visitorLog.strLogIn);

      await createDuplicatePhotoVisitor({
        filename: fileName,
        newFilename: newFileName,
      });

      const response = await createVisitorLog(signInPayload).unwrap();
      if (response.ghMessage) {
        setShowModal(false);
        resetForm();
      }

      handleDifferentOfficeVisitorLog(visitorLog as VisitorLog);
    },
    [
      updateVisitorLog,
      createSignInPayload,
      createFileNames,
      createDuplicatePhotoVisitor,
      createVisitorLog,
      setShowModal,
      resetForm,
      handleDifferentOfficeVisitorLog,
    ]
  );

  const handleYesDifferentOffice = useCallback(async () => {
    try {
      if (visitorDetailSignInDifferentOffice) {
        const signOutPayload = {
          logOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          sysLogOut: true,
          returned: true,
        };

        if (visitorDetailSignInDifferentOffice.deptLogOut !== null) {
          await handleSignOutAndSignIn(
            visitorLogSignInDifferentOffice,
            signOutPayload
          );
          return;
        }

        // Handle department sign out first
        await updateVisitorsLogDetail({
          id: visitorDetailSignInDifferentOffice.strId,
          dateTime: visitorDetailSignInDifferentOffice.strDeptLogIn,
          deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          userDeptLogOutId: null,
        }).unwrap();

        await handleSignOutAndSignIn(
          visitorLogSignInDifferentOffice,
          signOutPayload
        );
        return;
      }

      // Handle direct sign out case
      const signOutPayloadDirect: IVisitorSignOutPayload = {
        deptLogOut: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        sysDeptLogOut: true,
      };

      await signOutVisitor({
        payload: signOutPayloadDirect,
        dateTime: visitorLogSignInDifferentOffice?.strLogIn as string,
        strId: visitorLogSignInDifferentOffice?.strId as string,
      });

      await handleSignOutAndSignIn(visitorLogSignInDifferentOffice, {});
    } catch (error) {
      console.log("Error handling different office visitor:", error);
      showErrorToast("Failed to transfer visitor");
    }
  }, [
    visitorDetailSignInDifferentOffice,
    visitorLogSignInDifferentOffice,
    handleSignOutAndSignIn,
    signOutVisitor,
    updateVisitorsLogDetail,
    showErrorToast,
  ]);

  const handleCancelDifferentOffice = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    // State
    ticketId,
    purpose,
    isSubmitting,
    currentVisitorLog,
    currentVisitorLogInDetailSignOut,
    idVisitorImage,
    photoVisitorImage,
    showVisitorInformationCheckingModal,
    showSignOutModal,
    showModal,
    modalMessage,
    isLoadingCreateVisitorLogDetail,
    isLoadingUpdateVisitorsLogDetail,
    isLoadingUpdateVisitorLog,
    isLoadingCreateVisitorLog,
    isLoadingSignOutVisitor,
    isLoadingCreateDuplicatePhotoVisitor,

    // Actions
    setTicketId,
    handleChangePurpose,
    handleCloseVisitorInformationCheckingModal,
    handleSubmitVisitorLog,
    handleSignOut,
    handleTicketChecking,
    handleYesDifferentOffice,
    handleCancelDifferentOffice,
    setShowSignOutModal,
  };
};
