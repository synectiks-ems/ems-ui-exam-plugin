import * as React from 'react';
import * as _ from 'lodash';
import {RouteComponentProps, Link} from 'react-router-dom';
import {graphql, QueryProps, compose, withApollo} from 'react-apollo';
import {AcExamSettingListQuery} from '../../types';
import {NavItem,NavLink, TabPane, TabContent} from 'reactstrap';
import ExamDetailsPage from './ExamDetailsPage';
import EditExam from './EditExam';
import '../../../css/dark.css';
import * as AcExamSettingListQueryGql from './AcExamSettingListQuery.graphql';
import withLoadingHandler from '../../../components/withLoadingHandler';
import {GET_EXAM_DATA,CREATE_FILTER_DATA_CACHE} from '../_queries';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
// import EditEx from './EditEx';
// import UpdateExam from './UpdateExam';


const w140 = {
  width: '140px',
  marginBottom: '5px',
};

type ExamTableStates = {
  exams: any;
  examData: any;
  branches: any;
  departments: any;
  batches: any;
  sections: any;
  pageSize: any;
  search: any;
  branchId: any;
  academicYearId: any;
  departmentId: any;
  createExamFilterDataCache: any;
  typesOfGradingList?: any;
  user: any;
  activeTab: any;
  ExObj: any;
};

export interface ExamProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
  createExamFilterDataCache?: any;
}

class ExamGrid extends React.Component<ExamProps, ExamTableStates> {
  constructor(props: ExamProps) {
    super(props);
    const params = new URLSearchParams(location.search);
    this.state = {
      activeTab: 0,
      ExObj: {},
      user: this.props.user,
      createExamFilterDataCache: this.props.createExamFilterDataCache,
      typesOfGradingList: this.props.typesOfGradingList,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      exams: {},
      examData: {
        batch: {
          id: '',
        },
        section: {
          id: '',
        },
        mutateResult: [],
        search: '',
      },
      branches: [],
      departments: [],
      batches: [],
      sections: [],
      pageSize: 5,
      search: '',
    };
    // this.createBranches = this.createBranches.bind(this);
    // this.createDepartments = this.createDepartments.bind(this);
    this.createBatches = this.createBatches.bind(this);
    this.createSections = this.createSections.bind(this);
    this.showDetail = this.showDetail.bind(this);
    this.SetObject = this.SetObject.bind(this);
    this.getcreateExamFilterDataCache = this.getcreateExamFilterDataCache.bind(this);
    this.toggleTab = this.toggleTab.bind(this);

    // this.searchHandlers = this.searchHandlers.bind(this);
    this.checkAllExams = this.checkAllExams.bind(this);
    this.onClickCheckbox = this.onClickCheckbox.bind(this);
    this.createExamRows = this.createExamRows.bind(this);
    this.createNoRecordMessage = this.createNoRecordMessage.bind(this);
    this.registerSocket = this.registerSocket.bind(this);
  }

  async toggleTab(tabNo: any) {
    await this.setState({
      activeTab: tabNo,
    });
  }

  async componentDidMount(){
    await this.registerSocket();
  }

  async registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();

    socket.onmessage = (response: any) => {
        let message = JSON.parse(response.data);
        console.log("1. ExamGrid. message received from server ::: ", message);
        this.setState({
            branchId: message.selectedBranchId,
            academicYearId: message.selectedAcademicYearId,
            departmentId: message.selectedDepartmentId,
        });
        console.log("ExamGrid. branchId: ",this.state.branchId);
        console.log("ExamGrid. departmentId: ",this.state.departmentId); 
        console.log("ExamGrid. ayId: ",this.state.academicYearId);  
    };

    socket.onopen = () => {
        console.log("ExamGrid. Opening websocekt connection to cmsbackend. User : ",
        new URLSearchParams(location.search).get("signedInUser")
        );
        socket.send(new URLSearchParams(location.search).get("signedInUser"));
    };

    window.onbeforeunload = () => {
        console.log("ExamGrid. Closing websocket connection with cms backend service");
    };
  }

  async getcreateExamFilterDataCache() {
    const {branchId, academicYearId, departmentId} = this.state;
    console.log('exam branch Id:', branchId);
    const {data} = await this.props.client.query({
      query: CREATE_FILTER_DATA_CACHE,
      variables: {
        branchId: '' + branchId,
        academicYearId: '' + academicYearId,
        departmentId: '' + departmentId,

      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      createExamFilterDataCache: data,
    });
  }

  createBatches(batches: any, selectedDepartmentId: any) {
    let batchesOptions = [
      <option key={0} value="">
        Select Year
      </option>,
    ];
    for (let i = 0; i < batches.length; i++) {
      let id = batches[i].id;
      let dptId = '' + batches[i].department.id;
      if (dptId == selectedDepartmentId) {
        batchesOptions.push(
          <option key={id} value={id}>
            {batches[i].batch}
          </option>
        );
      }
    }
    return batchesOptions;
  }

  createSections(sections: any, selectedBatchId: any) {
    let sectionsOptions = [
      <option key={0} value="">
        Select Section
      </option>,
    ];
    for (let i = 0; i < sections.length; i++) {
      let id = sections[i].id;
      let sbthId = '' + sections[i].batch.id;
      if (sbthId == selectedBatchId) {
        sectionsOptions.push(
          <option key={id} value={id}>
            {sections[i].section}
          </option>
        );
      }
    }
    return sectionsOptions;
  }

  checkAllExams(e: any) {
    const {examData} = this.state;
    const mutateResLength = examData.mutateResult.length;
    let chkAll = e.nativeEvent.target.checked;
    let els = document.querySelectorAll('input[type=checkbox]');

    var empty = [].filter.call(els, function(el: any) {
      if (chkAll) {
        el.checked = true;
  
        el.checked = false;
      }
    });
  }

  async getStDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in ExObj:', this.state.ExObj);
    await this.toggleTab(2);
  }

  onClickCheckbox(index: any, e: any) {
    // const { target } = e;
    const {id} = e.nativeEvent.target;
    let chkBox: any = document.querySelector('#' + id);
    chkBox.checked = e.nativeEvent.target.checked;
  }
  createNoRecordMessage(objAry: any) {
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const exams = tempObj.data.getExamList;
      const length = exams.length;
      if (length === 0) {
        retVal.push(<h4 className="ptl-06">No Record Found</h4>);
      }
    }
    return retVal;
  }

  createExamRows(objAry: any) {
    let {search} = this.state.examData;
    search = search.trim();
    const mutateResLength = objAry.length;
    const retVal = [];
    for (let x = 0; x < mutateResLength; x++) {
      const tempObj = objAry[x];
      const exams = tempObj.data.getExamList;
      const length = exams.length;
      for (let i = 0; i < length; i++) {
        const exam = exams[i];
        if (search) {
          if (exam.examName.indexOf(search) !== -1) {
            retVal.push(
              <tr key={exam.id}>
                <td>
                  <input
                    onClick={(e: any) => this.onClickCheckbox(i, e)}
                    checked={exam.isChecked}
                    type="checkbox"
                    name="chk"
                    id={'chk' + exam.id}
                  />
                </td>
                <td>
                  {/* <Link
                    className="table-link link-color"
                    to={`/plugins/ems-student/page/student?id=${student.id}`}
                  >
                    {student.studentName}
                  </Link> */}
                  {/* <a onClick={(e: any) => this.showDetail(student, e)}> */}
                  {/* <a
                    onClick={() => {
                      // this.toggleTab(1);
                      (e: any) => this.showDetail(student, e);
                    }}
                  >
                    {student.studentName}
                  </a> */}
                  <a
                    onClick={(e: any) => this.showDetail(exam, e)}
                    style={{color: '#307dc2'}}
                  >
                    {exam.examName}
                  </a>
                </td>
            
                <td>
                  {exam.department.name}
                </td>
                <td>{exam.batch.batch}</td>
                <td>{exam.section.section}</td>
                <td>{exam.subject.subjectDesc}</td>
                <td>{exam.strexamDate}</td>
                <td>{exam.startTime}</td>
                <td>{exam.endTime}</td>
                <td>
                <button
                    className="btn btn-primary"
                    onClick={(e: any) => this.getStDetail(exam, e)}
                  >
                    {' '}
                    Edit{' '}
                  </button>
                  </td>
              </tr>
            );
            console.log('print exam obj:', exam);
          }
        } else {
          retVal.push(
            <tr key={exam.id}>
              <td>
                <input
                  onClick={(e: any) => this.onClickCheckbox(i, e)}
                  checked={exam.isChecked}
                  type="checkbox"
                  name="chk"
                  id={'chk' + exam.id}
                />
              </td>
              <td>
                {/* <Link
                  className="table-link link-color"
                  to={`/plugins/ems-student/page/student?id=${student.id}`}
                >
                  {student.studentName}
                </Link> */}
                {/* <a onClick={(e: any) => this.showDetail(student, e)}> */}
                {/* <a
                  onClick={() => {
                    // this.toggleTab(1);
                    (e: any) => this.showDetail(student, e);
                  }}
                >
                  {student.studentName}
                </a> */}
                <a
                  onClick={(e: any) => this.showDetail(exam, e)}
                  style={{color: '#307dc2'}}
                >
                  {exam.examName}
                </a>
              </td>
              <td>
                  {exam.department.name}
                </td>
                <td>{exam.batch.batch}</td>
                <td>{exam.section.section}</td>
                <td>{exam.subject.subjectDesc}</td>
                <td>{exam.strexamDate}</td>
                <td>{exam.startTime}</td>
                <td>{exam.endTime}</td>
                <td>
                <button
                    className="btn btn-primary"
                    onClick={(e: any) => this.getStDetail(exam, e)}
                  >
                    {' '}
                    Edit{' '}
                  </button>
                  </td>
            </tr>
          );
          console.log('print exam obj:', exam);
        }
      }
    }

    return retVal;
  }


  onChange = (e: any) => {
    const {search} = e.nativeEvent.target;
    const {name, value} = e.nativeEvent.target;
    const {examData} = this.state;
   
    if (name === 'year') {
      this.setState({
        examData: {
          ...examData,
          batch: {
            id: value,
          },
          section: {
            id: '',
          },
        },
      });
    } else if (name === 'sectionObj') {
      this.setState({
        examData: {
          ...examData,
          section: {
            id: value,
          },
        },
      });
    } 
    
   
    else {
      this.setState({
        examData: {
          ...examData,
          [name]: value,
        },
      });
    }
  };
  

  async showDetail(obj: any, e: any) {
    await this.SetObject(obj);
    console.log('3. data in Exbj:', this.state.ExObj);
    await this.toggleTab(1);
  }

  async SetObject(obj: any) {
    console.log('1. setting object :', obj);
    await this.setState({
      ExObj: obj,
    });
    console.log('2. data in obj:', obj);
  }

 

  onClick = (e: any) => {
    const {name, value} = e.nativeEvent.target;
    const {mutate} = this.props;
    const {examData, branchId, departmentId} = this.state;
    e.preventDefault();
    if (!branchId) {
      alert('Please select branch from preferences');
      return;
    }
    let examFilterInputObject = {
      branchId: branchId, 
      departmentId: departmentId, 
      batchId: examData.batch.id, 
      sectionId: examData.section.id, 
     
    };

    this.props.client
      .mutate({
        mutation: GET_EXAM_DATA,
        variables: {
          filter: examFilterInputObject,
        },
      })
      .then((data: any) => {
        const sdt = data;
        examData.mutateResult = [];
        examData.mutateResult.push(sdt);
        this.setState({
          examData: examData,
        });
        console.log('Exam filter mutation result ::::: ', examData.mutateResult);
      })
      .catch((error: any) => {
        console.log('there was an error sending the query result', error);
        return Promise.reject(`Could not retrieve exam data: ${error}`);
      });
  };

  render() {
    const { examData,
      createExamFilterDataCache,
      departmentId,
      typesOfGradingList,
      activeTab,
      user,} = this.state;
    return (
      <section className="customCss">
      <TabContent activeTab={activeTab}>
        <TabPane tabId={0}>
          <div className="container-fluid" style={{padding: '0px'}}>
            <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
              <div className="">
                <h4 className="ptl-06">Exam Details</h4>
              </div>
          </div>

            <div>
              <div className="student-flex">
                <div>
                  <label htmlFor="">Year</label>
                  <select
                    required
                    name="year"
                    id="year"
                    onChange={this.onChange}
                    value={examData.batch.id}
                    className="gf-form-input max-width-22"
                  >
                    {createExamFilterDataCache !== null &&
                    createExamFilterDataCache !== undefined &&
                    createExamFilterDataCache.batches !== null &&
                    createExamFilterDataCache.batches !== undefined
                      ? this.createBatches(
                        createExamFilterDataCache.batches,
                          departmentId
                        )
                      : null}
                    {/* {this.createBatches(createStudentFilterDataCache.batches, departmentId)} */}
                  </select>
                </div>
                <div>
                  <label htmlFor="">Section</label>
                  <select
                    required
                    name="sectionObj"
                    id="sectionObj"
                    onChange={this.onChange}
                    value={examData.section.id}
                    className="gf-form-input max-width-12"
                  >
                    {createExamFilterDataCache !== null &&
                    createExamFilterDataCache !== undefined &&
                    createExamFilterDataCache.sections !== null &&
                    createExamFilterDataCache.sections !== undefined
                      ? this.createSections(
                        createExamFilterDataCache.sections,
                          examData.batch.id
                        )
                      : null}
                  </select>
                </div>

              
                <div id="srch" className="margin-bott">
                  <label htmlFor="">Search</label>
                  <input
                    type="text"
                    className="gf-form-input"
                    name="search"
                    value={examData.search}
                    onChange={this.onChange}
                  />
                </div>
                <div className="bg-heading-bg studentSearch">
                  {/* <h4 className="ptl-06"></h4> */}
                  <button
                    className="btn btn-primary"
                    id="btnFind"
                    name="btnFind"
                    onClick={this.onClick}
                    style={w140}
                  >
                    Search Exams
                  </button>
                </div>
              </div>

              <table id="studentlistpage" className="striped-table fwidth bg-white">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        onClick={(e: any) => this.checkAllExams(e)}
                        value="checkedall"
                        name=""
                        id="chkCheckedAll"
                      />
                    </th>
                    <th>Exam Name</th>
                    
                    <th>Department</th>
                    <th>Year</th>
                    <th>Section</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {this.createExamRows(this.state.examData.mutateResult)}
                </tbody>
              </table>
              {/* <Pagination /> */}
              {this.createNoRecordMessage(this.state.examData.mutateResult)}
            </div>
          </div>
        </TabPane>
        <TabPane tabId={1}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                
                  <div className="">
                  <h4 className="ptl-06">Exam Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1  pull-right"
                    onClick={() => {
                      this.toggleTab(0);
                    }}
                  >
                    Back
                  </a>
                  <a
                    className="btn btn-primary m-l-1 pull-right"
                    onClick={(e: any) => {
                      print();
                    }}
                  >
                    Print
                  </a>
                </div>
              </div>
              {this.state.ExObj !== null && this.state.ExObj !== undefined && (
                <ExamDetailsPage data={this.state.ExObj} />
              )}
            </div>
            
          </TabPane>
          <TabPane tabId={2}>
            <div className="container-fluid" style={{padding: '0px'}}>
              <div className="m-b-1 bg-heading-bgStudent studentListFlex p-point5">
                <div className="">
                  <h4 className="ptl-06">Student Details</h4>
                </div>
                <div className="">
                  <a
                    className="btn btn-primary m-l-1"
                    onClick={() => {
                      this.toggleTab(1);
                    }}
                  >
                    Back
                  </a>
                </div>
              </div>
              {user !== null &&
                this.state.ExObj !== null &&
                this.state.ExObj !== undefined && (
                  <EditExam
                    user={user}
                    data={this.state.ExObj}
                    ExObj={this.state.ExObj}
                    batches={this.state.createExamFilterDataCache.batches}
                    sections={this.state.createExamFilterDataCache.sections}
                    subjects={this.state.createExamFilterDataCache.subjects}
                    semesters={this.state.createExamFilterDataCache.semesters}
                    typesOfGradingList={typesOfGradingList}
                  />
                )}
              {/*  */}
            </div>
          </TabPane>
      </TabContent>
    </section>
  );
}
}

export default withApollo(ExamGrid);
