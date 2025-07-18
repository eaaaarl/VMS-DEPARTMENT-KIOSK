export interface VisitorLog {
  id: number;
  strId: string;
  logIn: string;
  logOut: string | null;
  sysLogOut: string | null;
  visitorId: number;
  officeId: number;
  serviceId: number;
  specService: string;
  returned: {
    type: string;
    data: number[];
  };
  rating: number | null;
  comment: string | null;
  userLogInId: number | null;
  userLogOutId: number | null;
  iId: number;
  strLogIn: string;
  name: string;
  contactNo1: string;
  officeName: string;
  timeIn: string;
  timeOut: string | null;
  timeLapsed: string | null;
  service: string;
  photo: string;
  logDate: string;
  logTime: string;
  serviceName: string;
}

export interface IVisitorLogInfoResponse {
  results: VisitorLog[];
}

export interface VisitorLogDetail {
  id: number;
  strId: string;
  logIn: string;
  deptLogIn: string;
  deptLogOut: string | null;
  sysDeptLogOut: string | null;
  visitorId: number;
  deptId: number;
  reason: string;
  rating: number | null;
  comment: string | null;
  userDeptLogInId: number;
  userDeptLogOutId: number | null;
  name: string;
  officeName: string;
  logDate: string;
  strLogIn: string;
  strDeptLogIn: string;
  serviceName: string;
  officeLogIn: string;
  departmentLogIn: string;
}

export interface IVisitorLogDetailResponse {
  results: VisitorLogDetail[];
}

export interface IVisitorImageResponse {
  idExist: boolean;
  photoExist: boolean;
}

export interface ICreateVisitorLogDetailPayload {
  payload: {
    log: {
      id: number;
      strId: string;
      logIn: string;
      deptLogIn: string;
      visitorId: number;
      deptId: number;
      reason: string;
      userDeptLogInId: number | null;
    };
  };
}
