import * as React from 'react';
// import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import {withApollo} from 'react-apollo';
import '../../../css/exam-settings.css';
import AcExamListPage from './ExamGrid';
import ExamReportSrc from './ExamReportSrc';
import {
  // GET_DEPARTMENT_LIST,
  // GET_BATCH_LIST,
  GET_EXAM_SETTING_LIST,
  // GET_SECTION_LIST,
  CREATE_FILTER_DATA_CACHE,
  GET_EXAM_DATA,
  // ACEXAMLIST,
  TYPE_OF_GRADINGS,
} from '../_queries';
import MarkSubjectExam from './MarkSubjectExam';
import ExamGrid from './ExamGrid';
import Grading from './Grading';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';


export interface ExamSettingsProps extends React.HTMLAttributes<HTMLElement>{
  [data: string]: any;
  user?: any,
}
class ExamSettings extends React.Component<ExamSettingsProps, any> {
  constructor(props: ExamSettingsProps) {
    super(props);
    this.state = {
      activeTab: 0,
      user: this.props.user,
      examList: null,
      createExamFilterDataCache: null,
      typesOfGradingList: null,
      departmentList: null,
      batchList: null,
      sectionList: null,
      branchId: null,
      academicYearId: null,
      departmentId: null,
    };
    this.registerSocket = this.registerSocket.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    // this.acExamSettings = this.acExamSettings.bind(this);
    this.getExamFilterCache = this.getExamFilterCache.bind(this);
    this.getTypesOfGrading = this.getTypesOfGrading.bind(this);
    // this.getDepartmentList = this.getDepartmentList.bind(this);
    // this.getBatchList = this.getBatchList.bind(this);
    // this.getSectionList = this.getSectionList.bind(this);
  }

  async componentDidMount(){
    await this.registerSocket();
    // await this.acExamSettings();
    await this.getExamFilterCache();
    await this.getTypesOfGrading();
  }

  registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();

    socket.onmessage = (response: any) => {
        let message = JSON.parse(response.data);
        console.log("ExamSettings Index. message received from server ::: ", message);
        this.setState({
            branchId: message.selectedBranchId,
            academicYearId: message.selectedAcademicYearId,
            departmentId: message.selectedDepartmentId,
        });
        console.log("ExamSettings Index. branchId: ",this.state.branchId);
        console.log("ExamSettings Index. departmentId: ",this.state.departmentId);  
        console.log("ExamSettings Index. ayId: ",this.state.academicYearId);  
    }

    socket.onopen = () => {
        console.log("ExamSettings Index. Opening websocekt connection to cmsbackend. User : ",this.state.user.login);
        socket.send(this.state.user.login);
    }

    window.onbeforeunload = () => {
        console.log("ExamSettings. Closing websocket connection with cms backend service");
    }
  }

  async toggleTab(tabNo: any) {
    this.setState({
      examList: null,
      activeTab: tabNo,
    });
    // let bid = 34;
    // let aid = 56;
    if (tabNo === 0) {
      this.getTypesOfGrading();
    }
    if (tabNo === 1) {
      this.getExamFilterCache();
      this.getTypesOfGrading();
    }
    if (tabNo === 2) {
      this.getExamFilterCache();
      this.getTypesOfGrading();
      
    }
    
    this.setState({
      activeTab: tabNo,
    });
  }

  // async acExamSettings() {
  //   const {data} = await this.props.client.query({
  //     query: ACEXAMLIST,
  //     fetchPolicy: 'no-cache',
  //   });
  //   this.setState({
  //     examList: data,
  //   });
  // }

  async getExamFilterCache() {
    const {branchId, academicYearId, departmentId} = this.state;
    const {data} = await this.props.client.query({
      query: CREATE_FILTER_DATA_CACHE,
        variables: {
          branchId: branchId,
          academicYearId: academicYearId,
          departmentId: departmentId,
        },
      
      fetchPolicy: 'no-cache',
    });
    this.setState({
      createExamFilterDataCache: data,
    });
  }

  async getTypesOfGrading() {
    // const {typesOfGradingList} = this.state;
    const {data} = await this.props.client.query({
      query: TYPE_OF_GRADINGS,
      fetchPolicy: 'no-cache',
    });
    this.setState({
      typesOfGradingList: data,
    });
  }

  // async getDepartmentList(bid: any, aid: any) {
  //   const {data} = await this.props.client.query({
  //     query: GET_DEPARTMENT_LIST,
  //     fetchPolicy: 'no-cache',
  //   });

  //   this.setState({
  //     departmentList: data,
  //   });
  // }

  // async getBatchList(bid: any, aid: any) {
  //   const {data} = await this.props.client.query({
  //     query: GET_BATCH_LIST,
  //     fetchPolicy: 'no-cache',
  //   });

  //   this.setState({
  //     batchList: data,
  //   });
  // }

  // async getSectionList(bid: any, aid: any) {
  //   const {data} = await this.props.client.query({
  //     query: GET_SECTION_LIST,
  //     fetchPolicy: 'no-cache',
  //   });

  //   this.setState({
  //     sectionList: data,
  //   });
  // }

  render() {
    const {activeTab, user, examList, createExamFilterDataCache, typesOfGradingList} = this.state;
    return (
      <section className="tab-container row vertical-tab-container">
        <Nav tabs className="pl-3 pl-3 mb-4 mt-4 col-sm-2">
          <NavItem className="cursor-pointer">
          <NavLink
          className={`vertical-nav-link ${activeTab === 0 ? 'side-active' : ''}`}
          onClick={() => {
            this.toggleTab(0);
          }}>
          Create Grade
          </NavLink>
          </NavItem>
          
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 1 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(1);
              }}>
              Exams List
            </NavLink>
          </NavItem>

          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 2 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(2);
              }}>
              Add Exam
            </NavLink>
          </NavItem>
          </Nav>
          {/* <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 2 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(2);
              }}
            >
              Report
            </NavLink>
          </NavItem>
          <NavItem className="cursor-pointer">
            <NavLink
              className={`vertical-nav-link ${activeTab === 3 ? 'side-active' : ''}`}
              onClick={() => {
                this.toggleTab(3);
              }}
            >
              Grading
            </NavLink>
          </NavItem> */}
        {/* </Nav> */}
        <TabContent activeTab={activeTab} className="col-sm-10 border-left p-t-1">
          
          <TabPane tabId={0}>
            {
                user !== null && typesOfGradingList !== null && (
                  <Grading user={user} typesOfGradingList={typesOfGradingList.typeOfGradings} />
                )
            }
          </TabPane>
          
          <TabPane tabId={1}>
          {user !== null && createExamFilterDataCache !== null && typesOfGradingList !== null && (
              <ExamGrid
                user={user}
                createExamFilterDataCache={
                  createExamFilterDataCache.createExamFilterDataCache
                }
                typesOfGradingList={typesOfGradingList.typeOfGradings}
              />
            )}
          </TabPane>

          <TabPane tabId={2}>
            {
              user !== null && createExamFilterDataCache !== null && typesOfGradingList !== null &&  (
                <MarkSubjectExam
                 user={user} 
                 examFilterCacheList={createExamFilterDataCache.createExamFilterDataCache} 
                 typesOfGradingList={typesOfGradingList.typeOfGradings} 
                 />
              )
            }
          </TabPane>

          {/* <TabPane tabId={2}>
            {
              user !== null && examFilterCacheList !== null && (
                <ExamReportSrc user={user} examFilterCacheList={examFilterCacheList.createExamFilterDataCache} />
              )
            }
          </TabPane>

          <TabPane tabId={3}>
            
          </TabPane> */}
        </TabContent>
      </section>
    );
  }
}

export default withApollo(ExamSettings);
