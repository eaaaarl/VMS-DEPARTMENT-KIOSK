import {
    ICreateVisitorLogDetailPayload,
    ICreateVisitorLogPayload,
    IVisitorSignOutPayload,
    VisitorLog,
    VisitorLogDetail
} from '@/feature/visitor/api/inteface';
import {
    useCreateVisitorLogDetailMutation,
    useCreateVisitorLogDuplicatePhotoMutation,
    useCreateVisitorLogMutation,
    useLazyVisitorImageQuery,
    useLazyVisitorLogInDetailInfoQuery,
    useLazyVisitorLogInfoQuery,
    useSignOutVisitorLogDetailMutation,
    useUpdateVisitorLogMutation,
    useUpdateVisitorsLogDetailMutation
} from '@/feature/visitor/api/visitorApi';
import { format, parse, subMinutes } from 'date-fns';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';

interface DepartmentCameraEntry {
  id: number;
  officeId: string | number;
  name?: string;
}

interface UseVisitorManagementReturn {
  // State
  currentVisitorLog: VisitorLog | null;
  currentVisitorLogInDetailSignOut: VisitorLogDetail | null;
  idVisitorImage: string | null;
  photoVisitorImage: string | null;
  purpose: string;
  showVisitorInformationCheckingModal: boolean;
  showSignOutModal: boolean;
  showModal: boolean;
  modalMessage: string;
  isLoadingCreateVisitorLogDetail: boolean;
  isLoadingUpdateVisitorsLogDetail: boolean;
  
  // Methods
  handleChangePurpose: (purpose: string) => void;
  handleCloseVisitorInformationCheckingModal: () => void;
  handleSubmitVisitorLog: () => Promise<void>;
  handleSignOut: () => Promise<void>;
  handleScanSuccess: (scannedTicket: string) => Promise<void>;
  handleYesDifferentOffice: () => Promise<void>;
  handleCancelDifferentOffice: () => void;
  setShowSignOutModal: (show: boolean) => void;
}

export const MODAL_MESSAGES = {
  DIFFERENT_OFFICE: `Visitor is not currently in the office premise of this department,\nDo you want to automatically sign out\ntheir previous office location?`,
};

export const useVisitorManagement = (
  departmentCameraEntry: DepartmentCameraEntry | null
): UseVisitorManagementReturn => {
  // UI State
  const [showVisitorInformationCheckingModal, setShowVisitorInformationCheckingModal] = useState(false);
  const [currentVisitorLog, setCurrentVisitorLog] = useState<VisitorLog | null>(null);
  const [currentVisitorLogInDetailSignOut, setCurrentVisitorLogInDetailSignOut] = useState<VisitorLogDetail | null>(null);
  const [purpose, setPurpose] = useState('');
  const [idVisitorImage, setIdVisitorImage] = useState<string | null>(null);
  const [photoVisitorImage, setPhotoVisitorImage] = useState<string | null>(null);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [visitorDetailSignInDifferentOffice, setVisitorDetailSignInDifferentOffice] = useState<VisitorLogDetail | null>(null);
  const [visitorLogSignInDifferentOffice, setVisitorLogSignInDifferentOffice] = useState<VisitorLog | null>(null);

  // RTK Query Hooks
  const [visitorLogInfo] = useLazyVisitorLogInfoQuery();
  const [visitorLogInDetailInfo] = useLazyVisitorLogInDetailInfoQuery();
  const [visitorImage] = useLazyVisitorImageQuery();
  const [createVisitorLogDetail, { isLoading: isLoadingCreateVisitorLogDetail }] = useCreateVisitorLogDetailMutation();
  const [updateVisitorsLogDetail, { isLoading: isLoadingUpdateVisitorsLogDetail }] = useUpdateVisitorsLogDetailMutation();
  const [updateVisitorLog, { isLoading: isLoadingUpdateVisitorLog }] = useUpdateVisitorLogMutation();
  const [createVisitorLog, { isLoading: isLoadingCreateVisitorLog }] = useCreateVisitorLogMutation();
  const [signOutVisitor, { isLoading: isLoadingSignOutVisitor }] = useSignOutVisitorLogDetailMutation();
  const [createDuplicatePhotoVisitor, { isLoading: isLoadingCreateDuplicatePhotoVisitor }] = useCreateVisitorLogDuplicatePhotoMutation();

  const validatePurpose = useCallback((purposeText: string): boolean => {
    if (purposeText.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Please enter a purpose of the visit!',
      });
      return false;
    }
    return true;
  }, []);

  const handleChangePurpose = (purpose: string) => {
    setPurpose(purpose);
  };

  const handleCloseVisitorInformationCheckingModal = () => {
    setShowVisitorInformationCheckingModal(false);
    setCurrentVisitorLog(null);
    setIdVisitorImage(null);
    setPhotoVisitorImage(null);
    setPurpose('');
  };

  const checkVisitorData = useCallback((visitorData: any) => {
    if (visitorData?.results?.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'ID Not in use!',
        text2: 'Please check the ticket id'
      });
      return false;
    }
    return true;
  }, []);

  const checkVisitorLoggedOut = useCallback((visitorData: any) => {
    if (visitorData?.results?.[0]?.logOut !== null) {
      Toast.show({
        type: 'error',
        text1: 'ID Already Logged Out!',
      });
      return true;
    }
    return false;
  }, []);

  const fetchVisitorImages = useCallback(async (logInTime: string) => {
    try {
      const imageUrl = logInTime.replace(' ', '_').replace(/:/g, '-') + '.png';
      const imageData = await visitorImage({ fileName: imageUrl }).unwrap();

      if (imageData.idExist && imageData.photoExist) {
        setIdVisitorImage(`id_${imageUrl}`);
        setPhotoVisitorImage(`face_${imageUrl}`);
      } else {
        setIdVisitorImage(null);
        setPhotoVisitorImage(null);
      }
    } catch (error) {
      console.log('Error fetching images:', error);
      setIdVisitorImage(null);
      setPhotoVisitorImage(null);
    }
  }, [visitorImage]);

  const handleSignOutVisitor = useCallback((visitorDetailData: any) => {
    setShowSignOutModal(true);
    setCurrentVisitorLogInDetailSignOut(visitorDetailData.results[0]);
  }, []);

  const handleSameOfficeVisitor = useCallback(async (visitorLogData: any) => {
    setShowVisitorInformationCheckingModal(true);
    setCurrentVisitorLog(visitorLogData.results[0]);
    await fetchVisitorImages(visitorLogData.results[0].strLogIn);
  }, [fetchVisitorImages]);

  const handleDifferentOfficeVisitor = useCallback((visitorLogData: any, visitorDetailData: any) => {
    setShowModal(true);
    setModalMessage(MODAL_MESSAGES.DIFFERENT_OFFICE);
    setVisitorDetailSignInDifferentOffice(visitorDetailData.results[0]);
    setVisitorLogSignInDifferentOffice(visitorLogData.results[0]);
  }, []);

  const handleScanSuccess = async (scannedTicket: string) => {
    try {
      const { data: visitorLog } = await visitorLogInfo({ strId: scannedTicket });
      const { data: visitorLogDetail } = await visitorLogInDetailInfo({ strId: scannedTicket });

      if (!checkVisitorData(visitorLog)) return;
      if (checkVisitorLoggedOut(visitorLog)) return;

      const sameOfficeVisitor = visitorLog?.results[0].officeId === Number(departmentCameraEntry?.officeId);
      const visitorNotLoggedOut = visitorLogDetail?.results?.length === 0 || visitorLogDetail?.results?.[0]?.deptLogOut !== null;

      if (sameOfficeVisitor && visitorNotLoggedOut) {
        // Visitor is same office and not logged out
        await handleSameOfficeVisitor(visitorLog);
        return;
      }

      const visitorISnotSameOfficeId = visitorLog?.results[0].officeId !== Number(departmentCameraEntry?.officeId);
      if (visitorISnotSameOfficeId) {
        handleDifferentOfficeVisitor(visitorLog, visitorLogDetail);
        return;
      }

      handleSignOutVisitor(visitorLogDetail);
    } catch (error) {
      console.log('Error checking ticket:', error);
      Alert.alert('Error', 'Failed to process ticket');
    }
  };

  const handleSubmitVisitorLog = async () => {
    if (!validatePurpose(purpose)) return;

    try {
      const payload: ICreateVisitorLogDetailPayload = {
        payload: {
          log: {
            id: currentVisitorLog?.id as number,
            strId: currentVisitorLog?.strId as string,
            logIn: format(new Date(currentVisitorLog?.logIn || ''), 'yyyy-MM-dd HH:mm:ss'),
            deptLogIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            visitorId: currentVisitorLog?.visitorId as number,
            deptId: departmentCameraEntry?.id as number,
            reason: purpose,
            userDeptLogInId: null
          }
        }
      };

      const response = await createVisitorLogDetail(payload).unwrap();
      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 3000,
      });
      handleCloseVisitorInformationCheckingModal();
      setPurpose('');
    } catch (error) {
      console.log('Error submitting visitor log:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to submit visitor log',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      });
    }
  };

  const handleSignOut = async () => {
    if (!currentVisitorLogInDetailSignOut?.strId || !currentVisitorLogInDetailSignOut?.strDeptLogIn) {
      Toast.show({
        type: 'error',
        text1: 'No visitor log in detail found!',
        text2: 'Please check the ticket id',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      });
      return;
    }

    try {
      const dateTimeDeptLogin = currentVisitorLogInDetailSignOut.strDeptLogIn;
      const visitorStrId = currentVisitorLogInDetailSignOut.strId;

      const response = await updateVisitorsLogDetail({
        id: visitorStrId,
        dateTime: dateTimeDeptLogin,
        deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
        userDeptLogOutId: null,
      }).unwrap();

      Toast.show({
        type: 'success',
        text1: response.ghMessage.toUpperCase(),
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 3000,
      });
      setShowSignOutModal(false);
      setPurpose('');
    } catch (error) {
      console.log('Sign out error:', error);
      Toast.show({
        type: 'error',
        text1: 'Sign Out Failed',
        text2: 'Please try again or check your connection',
        position: 'bottom',
        bottomOffset: 100,
        visibilityTime: 4000,
      });
    }
  };

  const showErrorToast = useCallback((title: string, subtitle?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: subtitle,
      position: 'bottom',
      bottomOffset: 100,
      visibilityTime: 4000,
    });
  }, []);

  const resetForm = useCallback(() => {
    setPurpose('');
  }, []);

  const handleDifferentOfficeVisitorLog = useCallback(async (visitorLogData: VisitorLog) => {
    setShowVisitorInformationCheckingModal(true);
    setCurrentVisitorLog(visitorLogData);
    await fetchVisitorImages(visitorLogData.strLogIn);
  }, [fetchVisitorImages]);

  const handleYesDifferentOffice = async () => {
    try {
      // If visitor is Sign In the Department Office have now a Visitor log detail
      if (visitorDetailSignInDifferentOffice) {
        // Sign out from previous office
        if (visitorDetailSignInDifferentOffice.deptLogOut !== null) {
          const visitorStrId = visitorLogSignInDifferentOffice?.strId;
          const dateTimeStrLogin = visitorLogSignInDifferentOffice?.strLogIn;

          const payloadToSignOutOffice = {
            logOut: format(subMinutes(new Date(), 1), 'yyyy-MM-dd HH:mm:ss'),
            sysLogOut: true,
            returned: true,
          };

          await updateVisitorLog({
            id: visitorStrId as string,
            dateTime: dateTimeStrLogin || '',
            ...payloadToSignOutOffice
          }).unwrap();

          // Parse and format date
          const logDateStr = visitorLogSignInDifferentOffice?.logDate as string;
          const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date());
          const formattedDate = format(parsedDate, 'yyyy-MM-dd');

          // Sign in to new office
          const PayloadSignInOffice: ICreateVisitorLogPayload = {
            id: visitorLogSignInDifferentOffice?.id as number,
            strId: visitorLogSignInDifferentOffice?.strId as string,
            logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
            logInDate: formattedDate,
            visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
            officeId: Number(departmentCameraEntry?.officeId),
            serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
            returned: false,
            specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
            userLogInId: 0,
          };

          const newfileName = PayloadSignInOffice.logIn.replace(' ', '_').replace(/:/g, "-") + '.png';
          const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(/:/g, "-") + '.png';
          await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName });

          const response = await createVisitorLog(PayloadSignInOffice).unwrap();
          if (response.ghMessage) {
            setShowModal(false);
            resetForm();
          }

          handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog);
          return;
        }

        // visitorDetailSignInDifferentOffice.deptLogOut === null
        // If the Visitor Is Sign in in the Office in previous office it is not sign out
        const dateTimeDeptLogin = visitorDetailSignInDifferentOffice.strDeptLogIn;
        const visitorStrId = visitorDetailSignInDifferentOffice.strId;

        await updateVisitorsLogDetail({
          id: visitorStrId,
          dateTime: dateTimeDeptLogin,
          deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
          userDeptLogOutId: null,
        }).unwrap();

        const payloadToSignOutOffice = {
          logOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
          sysLogOut: true,
          returned: true,
        };

        await updateVisitorLog({
          id: visitorStrId as string,
          dateTime: visitorLogSignInDifferentOffice?.strLogIn || '',
          ...payloadToSignOutOffice
        }).unwrap();

        const logDateStr = visitorLogSignInDifferentOffice?.logDate as string;
        const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date());
        const formattedDate = format(parsedDate, 'yyyy-MM-dd');

        const PayloadSignInOffice = {
          id: visitorLogSignInDifferentOffice?.id as number,
          strId: visitorLogSignInDifferentOffice?.strId as string,
          logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          logInDate: formattedDate,
          visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
          officeId: Number(departmentCameraEntry?.officeId),
          serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
          returned: false,
          specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
          userLogInId: 0,
        };

        const newfileName = PayloadSignInOffice.logIn.replace(' ', '_').replace(/:/g, "-") + '.png';
        const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(/:/g, "-") + '.png';
        await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName });

        const response = await createVisitorLog(PayloadSignInOffice).unwrap();
        if (response.ghMessage) {
          setShowModal(false);
          resetForm();
        }

        handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog);
        return;
      }

      // If visitor is signing directly to the different office
      const visitorLog = visitorLogSignInDifferentOffice;
      const signOutPayloadDirect: IVisitorSignOutPayload = {
        deptLogOut: format(subMinutes(new Date(), 2), 'yyyy-MM-dd HH:mm:ss'),
        sysDeptLogOut: true
      };

      // Sign Out direct visitor
      await signOutVisitor({
        payload: signOutPayloadDirect,
        dateTime: visitorLog?.strLogIn as string,
        strId: visitorLog?.strId as string
      });

      // Sign In visitor again
      const logDateStr = visitorLogSignInDifferentOffice?.logDate as string;
      const parsedDate = parse(logDateStr, 'MM/dd/yyyy', new Date());
      const formattedDate = format(parsedDate, 'yyyy-MM-dd');

      const payloadSignIn: ICreateVisitorLogPayload = {
        id: visitorLogSignInDifferentOffice?.id as number,
        strId: visitorLogSignInDifferentOffice?.strId as string,
        logIn: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        logInDate: formattedDate,
        visitorId: visitorLogSignInDifferentOffice?.visitorId as number,
        officeId: Number(departmentCameraEntry?.officeId),
        serviceId: visitorLogSignInDifferentOffice?.serviceId as number,
        returned: false,
        specService: visitorLogSignInDifferentOffice?.specService as string ?? '',
        userLogInId: 0,
      };

      const newfileName = payloadSignIn.logIn.replace(' ', '_').replace(/:/g, "-") + '.png';
      const fileName = format(visitorLogSignInDifferentOffice?.strLogIn as string, 'yyyy-MM-dd HH:mm:ss').replace(" ", "_").replace(/:/g, "-") + '.png';
      await createDuplicatePhotoVisitor({ filename: fileName, newFilename: newfileName });

      const response = await createVisitorLog(payloadSignIn).unwrap();
      if (response.ghMessage) {
        setShowModal(false);
        resetForm();
      }

      handleDifferentOfficeVisitorLog(visitorLogSignInDifferentOffice as VisitorLog);
    } catch (error) {
      console.log('Error handling different office visitor:', error);
      showErrorToast('Failed to transfer visitor');
    }
  };

  const handleCancelDifferentOffice = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    // State
    currentVisitorLog,
    currentVisitorLogInDetailSignOut,
    idVisitorImage,
    photoVisitorImage,
    purpose,
    showVisitorInformationCheckingModal,
    showSignOutModal,
    showModal,
    modalMessage,
    isLoadingCreateVisitorLogDetail,
    isLoadingUpdateVisitorsLogDetail,
    
    // Methods
    handleChangePurpose,
    handleCloseVisitorInformationCheckingModal,
    handleSubmitVisitorLog,
    handleSignOut,
    handleScanSuccess,
    handleYesDifferentOffice,
    handleCancelDifferentOffice,
    setShowSignOutModal,
  };
};