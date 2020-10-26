import * as moment from 'moment';
import * as React from 'react';
import {RouteComponentProps, Link} from 'react-router-dom';
import {graphql, QueryProps, MutationFunc, compose, withApollo} from 'react-apollo';
import * as AddExamMutationGql from './AddExamMutation.graphql';
import {LoadExamSubjQueryCacheForAdmin, AddExamMutation} from '../../types';
// import withExamSubjDataLoader from './withExamSubjDataLoader';
import 'react-datepicker/dist/react-datepicker.css';
import withLoadingHandler from '../withLoadingHandler';
import {ADD_EXAM_SETTING, CREATE_FILTER_DATA_CACHE, TYPE_OF_GRADINGS} from '../_queries';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ListGrade from './ListGrade';

const w180 = {
  width: '180px',
};

interface type {
  checked: boolean;
}

type ExamState = {
  isModalOpen: any;
  user: any;
  examData: any;
  branches: any;
  academicYears: any;
  departments: any;
  batches: any;
  subjects: any;
  // semesters: any;
  sections: any;
  submitted: any;
  noOfExams: number;
  dateofExam: any;
  dayValue: any;
  isSubjectSame: any;
  startDate: any;
  gradeType: any;
  selectedGrade: any;
  groupValue: any;
  gradingId: any;

  branchId: any;
  academicYearId: any;
  departmentId: any;
  examFilterCacheList: any;
  typesOfGradingList: any;
};

class SaData {
  examName: any;
  examDate: any;
  startTime: any;
  endTime: any;
  gradeType: any;
  total: any;
  passing: any;
  actions: any;
  academicyearId: any;
  subjectId: any;
  departmentId: any;
  batchId: any;
  semester: any;
  sectionId: any;
  branchId: any;
  typeOfGradingId: any;
  countvalue: any;
  groupvalue: any;
  constructor(
    examName: any,
    examDate: any,
    startTime: any,
    endTime: any,
    gradeType: any,
    total: any,
    passing: any,
    actions: any,
    academicyearId: any,
    subjectId: any,
    departmentId: any,
    batchId: any,
    semester: any,
    sectionId: any,
    branchId: any,
    typeOfGradingId: any,
    countvalue: any,
    groupvalue: any
  ) {
    this.examName = examName;
    this.semester = semester;
    this.examDate = examDate;
    this.startTime = startTime;
    this.endTime = endTime;
    this.gradeType = gradeType;
    this.total = total;
    this.passing = passing;
    this.actions = actions;
    this.departmentId = departmentId;
    this.academicyearId = academicyearId;
    this.subjectId = subjectId;
    this.sectionId = sectionId;
    this.batchId = batchId;
    this.branchId = branchId;
    this.typeOfGradingId = typeOfGradingId;
    this.countvalue = countvalue;
    this.groupvalue = groupvalue;
  }
}

export interface MarkSubjectExamProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
  examFilterCacheList?: any;
  typesOfGradingList?: any;
}

class MarkSubjectExam<T = {[data: string]: any}> extends React.Component<MarkSubjectExamProps, ExamState> {
  constructor(props: MarkSubjectExamProps) {
    super(props);
    this.state = {
      isModalOpen: false,
      user: this.props.user,
      typesOfGradingList: this.props.typesOfGradingList,
      branchId: null,
      academicYearId: null,
      departmentId: null,
      examFilterCacheList: this.props.examFilterCacheList,
      gradeType: '',
      noOfExams: 0,
      selectedGrade: '',
      groupValue: '',
      gradingId: '',
      dayValue: [],
      dateofExam: '',
      isSubjectSame: false,
      examData: {
        examName: "",
        // branch: {
        //   id: 1951,
        //   //1851 1001
        // },
        // academicYear: {
        //   id: 1701,
        //   //1701 1051
        // },
        // department: {
        //   id: '',
        // },
        batch: {
          id: '',
        },
        // semester: {
        //   id: '',
        // },
        semester: "",
        subject: {
          id: '',
        },
        section: {
          id: '',
        },
        mutateResult: [],
        filtered: [],
        selectedIds: '',
        payLoad: [],
        textValueMap: {},
        exmDate: {},
        exmDay: {},
        exmStTime: {},
        exmNdTime: {},
        exmPassMarks: {},
        exmTotalMarks: {},
        txtCmtVal: {},
        exmcountvalues: {},
      },
      branches: [],
      academicYears: [],
      departments: [],
      batches: [],
      // semesters: [],
      sections: [],
      subjects: [],
      submitted: false,
      startDate: '',
    };
    this.registerSocket = this.registerSocket.bind(this);
    this.createDepartments = this.createDepartments.bind(this);
    this.createBatches = this.createBatches.bind(this);
    
    this.createSubjects = this.createSubjects.bind(this);
    this.createSections = this.createSections.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeGrade = this.handleChangeGrade.bind(this);
    this.createGrid = this.createGrid.bind(this);
    this.validateDuplicateSubject = this.validateDuplicateSubject.bind(this);
    this.handleStTimeChange = this.handleStTimeChange.bind(this);
    this.handleNdTimeChange = this.handleNdTimeChange.bind(this);
    this.handlePassMarksChange = this.handlePassMarksChange.bind(this);
    this.handleTotalMarksChange = this.handleTotalMarksChange.bind(this);
    this.handleExamDateChange = this.handleExamDateChange.bind(this);
    this.isDatesOverlap = this.isDatesOverlap.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setSelectedGrade = this.setSelectedGrade.bind(this);
    this.doSave = this.doSave.bind(this);
    // this.checkForSelectedGrades = this.checkForSelectedGrades.bind(this);
  }

  async componentDidMount(){
    await this.registerSocket();
  }

  registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();

    socket.onmessage = (response: any) => {
        let message = JSON.parse(response.data);
        console.log("MarkSubjectExam. message received from server ::: ", message);
        this.setState({
            branchId: message.selectedBranchId,
            academicYearId: message.selectedAcademicYearId,
            departmentId: message.selectedDepartmentId,
        });
        console.log("MarkSubjectExam. branchId: ",this.state.branchId);
        console.log("MarkSubjectExam. departmentId: ",this.state.departmentId);  
        console.log("MarkSubjectExam. ayId: ",this.state.academicYearId);  
    }

    socket.onopen = () => {
        console.log("MarkSubjectExam. Opening websocekt connection to cmsbackend. User : ",this.state.user.login);
        socket.send(this.state.user.login);
    }

    window.onbeforeunload = () => {
        console.log("MarkSubjectExam. Closing websocket connection with cms backend service");
    }
  }

  // componentDidMount() {
  //   this.checkForSelectedGrades();
  // }

  // checkForSelectedGrades() {
  //   var selectedGrades = localStorage.getItem('selectedGrades');
  //   if (selectedGrades) {
  //     let selectedGra = JSON.parse(selectedGrades);
  //     this.setState({selectedGrade: selectedGra});

  //     this.setState({groupValue: selectedGra[0].groupvalue});
  //     this.setState({gradingId: selectedGra[0].id});

  //     console.log('holdvalue:', selectedGrades);
  //     localStorage.removeItem('selectedGrades');
  //     this.setState({
  //       gradeType: 'GRADE',
  //     });
  //   } else {
  //     this.setState({gradingId: '7534'});
  //     this.setState({groupValue: '1'});
  //   }
  // }

  createDepartments(departments: any, selectedBranchId: any) {
    let departmentsOptions = [
      <option key={0} value="">
        Select Department
      </option>,
    ];
    for (let i = 0; i < departments.length; i++) {
      if (selectedBranchId == departments[i].branch.id) {
        departmentsOptions.push(
          <option key={departments[i].id} value={departments[i].id}>
            {departments[i].name}
          </option>
        );
      }
    }
    return departmentsOptions;
  }

  createBranches(branches: any) {
    let branchesOptions = [
      <option key={0} value="">
        Select Branch
      </option>,
    ];
    for (let i = 0; i < branches.length; i++) {
      branchesOptions.push(
        <option key={branches[i].id} value={branches[i].id}>
          {branches[i].branchName}
        </option>
      );
    }
    return branchesOptions;
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

  createSubjects(subjects: any, selectedDepartmentId: any, selectedBatchId: any) {
    let subjectsOptions = [
      <option key={0} value=""> Select Subject </option>,
    ];
    for (let i = 0; i < subjects.length; i++) {
      let id = subjects[i].id;
      if (
        subjects[i].department.id == selectedDepartmentId &&
        subjects[i].batch.id == selectedBatchId
      ) {
        subjectsOptions.push(
          <option key={id} value={id}>
            {subjects[i].subjectDesc}
          </option>
        );
      }
    }
    return subjectsOptions;
  }

  // createSemesters(semesters: any) {
  //   let semestersOptions = [
  //     <option key={0} value="">
  //       Select Semester
  //     </option>,
  //   ];
  //   for (let i = 0; i < semesters.length; i++) {
  //     let id = semesters[i].description;
  //     semestersOptions.push(
  //       <option key={id} value={id}>
  //         {semesters[i].description}
  //       </option>
  //     );
  //   }
  //   return semestersOptions;
  // }

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

  increaseExamValue() {
    if (this.state.noOfExams < 5) {
      this.setState({noOfExams: this.state.noOfExams + 1});
    }
  }

  decreaseExamValue() {
    if (this.state.noOfExams !== 0) {
      this.setState({noOfExams: this.state.noOfExams - 1});
    }
  }

  onFormSubmit = (e: any) => {
    this.setState({
      submitted: true,
    });

    const {examData} = this.state;
    e.preventDefault();

    if (this.state.gradeType === '') {
      alert('Please select Grade Type');
      return;
    }

    if (this.state.noOfExams === 0) {
      alert('Please select no of exams');
      return;
    }

    if (this.state.departmentId && examData.batch.id && examData.section.id) {
      e.target.querySelector('#detailGridTable').removeAttribute('class');
      let btn = e.target.querySelector("button[type='submit']");
      // btn.setAttribute('disabled', true);
    }
  };

  onChange = (e: any) => {
    const {id, name, value} = e.nativeEvent.target;
    const {examData} = this.state;
    if (name === 'department') {
      this.setState({
        examData: {
          ...examData,
          // department: {
          //   id: value,
          // },
          batch: {
            id: '',
          },
          section: {
            id: '',
          },
          // semester: {
          //   id: '',
          // },
        },
      });
    } else if (name === 'batch') {
      this.setState({
        examData: {
          ...examData,
          batch: {
            id: value,
          },
          subject: {
            id: '',
          },
          section: {
            id: '',
          },
          // semester: {
          //   id: '',
          // },
        },
      });
     }
    // else if (name === 'semester') {
    //   this.setState({
    //     examData: {
    //       ...examData,
    //       semester: {
    //         id: value,
    //       },
    //     },
    //   });
    // } 
    else if (name === 'subject') {
      this.setState({
        examData: {
          ...examData,
          subject: {
            ...this.createSubjects,
          },
        },
      });
      this.validateDuplicateSubject(id);
    } else if (name === 'section') {
      this.setState({
        examData: {
          ...examData,
          section: {
            id: value,
          },
        },
      });
    } else {
      this.setState({
        examData: {
          ...examData,
          [name]: value,
        },
      });
    }
  };

  validateDuplicateSubject(objId: any) {
    let currentSub: any = document.querySelector('#' + objId);
    var isSubjectSame = false;
    for (let i = 0; i < this.state.noOfExams; i++) {
      let subOptions: any = document.querySelector('#subject' + i);
      if (
        subOptions.id !== currentSub.id &&
        subOptions.options[subOptions.selectedIndex].value !== '' &&
        subOptions.options[subOptions.selectedIndex].value ===
          currentSub.options[currentSub.selectedIndex].value
      ) {
        isSubjectSame = true;
        alert('Subject cannot be same for two exams');
        break;
      }
    }

    this.setState({
      isSubjectSame: isSubjectSame,
    });
    return isSubjectSame;
  }

  handleChangeGrade(e: any) {
    this.setState({
      gradeType: e.target.value,
    });
  }

  handleChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    const key = id;
    const val = value;
    e.preventDefault();
    let stDate = moment(val, 'YYYY-MM-DD');
    console.log(stDate);
    let dow = stDate.day();
    let days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    let dayname = days[dow];
    examData.textValueMap[id] = dayname;
    examData.exmDate[id] = stDate;
    this.setState({examData: examData});
  };

  handleStTimeChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    examData.exmStTime[id] = value;
    this.setState({examData: examData});
  };

  handleExamDateChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    examData.exmDate[id] = value;
    this.setState({examData: examData});
  };
  isDatesOverlap(startTime: any, endTime: any) {
    if (endTime.isBefore(startTime)) {
      alert('End time should not be prior to start time.');
      return true;
    }
    return false;
  }
  handleNdTimeChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    examData.exmNdTime[id] = value;
    this.setState({examData: examData});
  };

  handlePassMarksChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    examData.exmPassMarks[id] = value;
    console.log(value + 'new');
    this.setState({examData: examData});
  };

  handleTotalMarksChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData} = this.state;
    examData.exmTotalMarks[id] = value;
    this.setState({examData: examData});
  };

  onClick = (e: any) => {
    const {examData, branchId, academicYearId, departmentId} = this.state;
    e.preventDefault();

    // let txtEsNm: any = document.querySelector('#examName');
    // if (txtEsNm.value.trim() === '') {
    //   alert('Please provide an Exam Name');
    //   return;
    // }

    let allSubOpts: any = document.querySelectorAll('#subject');
    let isSubNotSelected = false;

    for (let i = 0; i < this.state.noOfExams; i++) {
      let subOptions: any = document.querySelector('#subject' + i);
      if (subOptions.options[subOptions.selectedIndex].value === '') {
        alert('Please select a subject');
        return;
      }
    }
    if (this.state.isSubjectSame) {
      alert("Duplicate subjects in exam schedule");
      return;
    }

    for (let i = 0; i < this.state.noOfExams; i++) {
      let exdt: any = document.querySelector('#examDate' + i);
      if (
        examData.exmDate[exdt.id] === undefined ||
        examData.exmDate[exdt.id] === null ||
        examData.exmDate[exdt.id] === ''
      ) {
        alert('Please select an Exam Date');
        return;
      }
    }
    for (let i = 0; i < this.state.noOfExams; i++) {
      let dt: any = document.querySelector('#startTime' + i);
      if (
        examData.exmStTime[dt.id] === undefined ||
        examData.exmStTime[dt.id] === null ||
        examData.exmStTime[dt.id] === ''
      ) {
        alert('Please select start time');
        return;
      }
    }
    for (let i = 0; i < this.state.noOfExams; i++) {
      let en: any = document.querySelector('#endTime' + i);
      let dt: any = document.querySelector('#startTime' + i);
      if (
        examData.exmNdTime[en.id] === undefined ||
        examData.exmNdTime[en.id] === null ||
        examData.exmNdTime[en.id] === ''
      ) {
        alert('Please select end time');
        return;
      }
      if (examData.exmStTime[dt.id] >= examData.exmNdTime[en.id]) {
        alert('Please enter valid end time');
        return;
      }
    }

    for (let i = 0; i < this.state.noOfExams; i++) {
      let pm: any = document.querySelector('#passingMarks' + i);
      if (
        examData.exmPassMarks[pm.id] === undefined ||
        examData.exmPassMarks[pm.id] === null ||
        examData.exmPassMarks[pm.id] === ''
      ) {
        alert('Please select passing marks for the listed exam');
        return;
      }
    }

    for (let i = 0; i < this.state.noOfExams; i++) {
      let tm: any = document.querySelector('#totalMarks' + i);
      let pm: any = document.querySelector('#passingMarks' + i);
      if (
        examData.exmTotalMarks[tm.id] === undefined ||
        examData.exmTotalMarks[tm.id] === null ||
        examData.exmTotalMarks[tm.id] === ''
      ) {
        alert('Please select total marks for the listed exam');
        return;
      }
      const passMarks = examData.exmPassMarks[pm.id];
      const totalMarks = examData.exmTotalMarks[tm.id];
      if (parseInt(totalMarks, 10) < parseInt(passMarks, 10)) {
        alert('Total marks should Greater than passing Marks');
        return;
      }
    }
    this.setState({examData: examData});
    for (let x = 0; x < this.state.noOfExams; x++) {
      let subOptions: any = document.querySelector('#subject' + x);
      for (let i = 0; i < this.state.noOfExams; i++) {
        let sd = new SaData(
          // txtEsNm.value.trim(),
          examData.examName,
          examData.exmDate['examDate' + i],
          examData.exmStTime['startTime' + i],
          examData.exmNdTime['endTime' + i],
          this.state.gradeType,
          examData.exmTotalMarks['totalMarks' + i],
          examData.exmPassMarks['passingMarks' + i],
          'ACTIVE',
          academicYearId,
          subOptions.options[subOptions.selectedIndex].value,
          departmentId,
          examData.batch.id,
          examData.semester,
          examData.section.id,
          branchId,
          (this.state.gradeType === "GRADE") ? this.state.selectedGrade : null,
          examData.exmcountvalues['countvalue' + i],
          (this.state.gradeType === "GRADE") ? this.state.groupValue : null
        );
        examData.payLoad.push(sd);
      }
    }
    this.setState({examData: examData});

    console.log('total IDS : ', examData.selectedIds);
    let btn: any = document.querySelector('#btnSave');
    btn.setAttribute('disabled', true);
    this.doSave();
    btn.removeAttribute('disabled');
    // return mutate({
    //   variables: {input: examData.payLoad},
    // })
    //   .then((data: any) => {
    //     btn.removeAttribute('disabled');
    //     console.log('Saved Result: ', data.data.addAcademicExamSetting);
    //     alert('Added Succesfully');
    //   })
    //   .catch((error: any) => {
    //     btn.removeAttribute('disabled');
    //     console.log('there is some error ', error);
    //     return Promise.reject(`there is some error while updating : ${error}`);
    //   });
  };

  async doSave(){
    const {examData} = this.state;
    await this.props.client.mutate({
      mutation: ADD_EXAM_SETTING,
      variables: { 
          input: examData.payLoad
      },
    })
    .then((data: any) => {
          console.log('Saved Result: ', data.data.addAcademicExamSetting);
          alert('Exam Added Succesfully');
        })
        .catch((error: any) => {
          console.log('there is some error ', error);
          return Promise.reject(`There is some error in exam add/update : ${error}`);
        });
  }

  showModal(e: any, bShow: boolean) {
    e && e.preventDefault();
    this.setState(() => ({
        isModalOpen: bShow
    }));
  }

  closeModal(bShow: boolean) {
    this.setState({
      isModalOpen: bShow
    });
  }

  setSelectedGrade(selectedGrades: any) {
    console.log("SELECTED GRADE :::: ",selectedGrades[0]);
    this.setState({
      selectedGrade: selectedGrades[0].id,
      groupValue: selectedGrades[0].groupvalue,
      isModalOpen: false
    });
  }

  createGrid(ary: any) {
    const {examData, examFilterCacheList, departmentId} = this.state;
    const retVal = [];
    for (let x = 0; x < this.state.noOfExams; x++) {
      let v = ary[x];
      retVal.push(
        <tbody>
          <tr id="custom-width-input">
            <td>
              <select name={'subject'} id={'subject' + x} onChange={this.onChange} value={examData.subject.id} className="gf-form-input max-width-14" >
                {
                  this.createSubjects( examFilterCacheList.subjects, departmentId, examData.batch.id )
                }
              </select>
            </td>
            <td>
            <input type="date" value={examData.dateofExam} id={'examDate' + x} name="examDate" maxLength={10} onChange={this.handleChange} className="gf-form-input max-width-12" />
            </td>

            <td>{examData.textValueMap['examDate' + x]}</td>

            <td>
              {' '}
              <input id={'startTime' + x} type="time" name="startTime" step="2" value={examData.startTime} onChange={this.handleStTimeChange} className="gf-form-input max-width-8" />{' '}
            </td>

            <td>
              {' '}
              <input id={'endTime' + x} type="time" name="endTime" step="2" value={examData.endTime} onChange={this.handleNdTimeChange} className="gf-form-input max-width-8" />{' '}
            </td>

            <td>
              {' '}
              <input id={'passingMarks' + x} name="passingMarks" value={examData.passing} onChange={this.handlePassMarksChange} className="gf-form-input max-width-8"/>{' '}
            </td>

            <td>
              {' '}
              <input
                id={'totalMarks' + x}
                name="totalMarks"
                value={examData.total}
                onChange={this.handleTotalMarksChange}
                className="gf-form-input max-width-8"
              />{' '}
            </td>
          </tr>
        </tbody>
      );
    }
    return retVal;
  }
  render() {
    // const {data: {createExamFilterDataCache, refetch}, mutate} = this.props;
    const { examData, branchId, departmentId, academicYearId, examFilterCacheList, isModalOpen, typesOfGradingList } = this.state;

    return (
      <section className="plugin-bg-white">
        <Modal isOpen={isModalOpen} className="react-strap-modal-container">
            <ModalHeader></ModalHeader>
            <ModalBody className="modal-content">
                <ListGrade examFilterCacheList={examFilterCacheList} typesOfGradingList={typesOfGradingList} onCloseModel={this.closeModal} onSelectGrade={this.setSelectedGrade}></ListGrade>
                {/* <button className="btn btn-danger border-bottom" onClick={(e) => this.showModal(e, false)}>Cancel</button> */}
            </ModalBody>
        </Modal>
        <div className="bg-heading p-1 m-1">
          <div className="e-flex align-baseline">
            <h4 className="m-r-1">Select Type of Grading.</h4>
            {/* <label className="m-r-1"> */}
              <input className="m-1" type="radio" value="PERCENTAGE" checked={this.state.gradeType === 'PERCENTAGE'} onChange={this.handleChangeGrade} />
                Percentage
              &nbsp;&nbsp;
            {/* </label> */}
            {/* <label className="m-r-1"> */}
              <input className="m-1" type="radio" value="GRADE" checked={this.state.gradeType === 'GRADE'} onChange={this.handleChangeGrade} />
              Grade
              
            {/* </label> */}

            {this.state.gradeType === 'GRADE' && (

              <span>&nbsp;&nbsp;
                {/* <Link to={`/plugins/ems-exam/page/grading`} className="btn btn-primary"> */}
                  
                  <button onClick={(e) => this.showModal(e, true)} className="btn btn-primary" id="btnContinue">Continue</button>
                {/* </Link> */}
              </span>
            )}
          </div>
        </div>
        <div className="p-1">
          <form className="gf-form-group" onSubmit={this.onFormSubmit}>
            <table id="t-attendance" className="markAttendance">
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>No of Exams</th>
                  <th>Create Exam</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select name="batch" id="batch" onChange={this.onChange} value={examData.batch.id} className="gf-form-input max-width-22" >
                      { 
                        this.createBatches( examFilterCacheList.batches, departmentId )
                      }
                    </select>
                  </td>

                  <td>
                  <select
                name="semester"
                id="semester"
                onChange={this.onChange}
                value={examData.semester}
              >
                <option value="">Select Semester</option>
                <option value="SEMESTER1">SEMESTER1</option>
                <option value="SEMESTER2">SEMESTER2</option>
                <option value="SEMESTER3">SEMESTER3</option>
                <option value="SEMESTER4">SEMESTER4</option>
                <option value="SEMESTER5">SEMESTER5</option>
                <option value="SEMESTER6">SEMESTER6</option>
              </select>
                  </td>

                  <td>
                    <select name="section" id="section" onChange={this.onChange} value={examData.section.id} className="gf-form-input max-width-22" >
                      {
                        this.createSections( examFilterCacheList.sections, examData.batch.id )
                      }
                    </select>
                  </td>

                  <td>
                      <a onClick={this.decreaseExamValue.bind(this)} className="btn btn-primary mr-1 btn-small" >
                        <i className="fa fa-minus" />
                      </a> {this.state.noOfExams} 
                      <a onClick={this.increaseExamValue.bind(this)} className="btn btn-primary mr-1 btn-small m-l-1" >
                        <i className="fa fa-plus" />
                      </a>
                  </td>

                  <td>
                    <button className="btn btn-primary" type="submit" id="btnTakeAtnd" name="btnTakeAtnd" style={{width: '130px'}} > Create Exam </button>
                  </td>
                </tr>
              </tbody>
            </table>

            

            <div className="hide" id="detailGridTable">
              <div className="tflex bg-heading mt-1 e-flex" id="detailGrid">
                <h4 className="p-1 py-2 mb-0"> Exam Name:  <input type="text" id="examName" name="examName"  value={examData.examName} onChange={this.onChange} className="h-input m-1" maxLength={300} /></h4>
                <div className="hhflex" />
              </div>
              <table className="fwidth">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Passing Marks</th>
                    <th>Total Marks</th>
                  </tr>
                </thead>
                {this.createGrid(examFilterCacheList)}
              </table>

              <div className="d-flex fwidth justify-content-between pt-2">
                <p />
                <div>
                  <button className="btn btn-primary border-bottom" id="btnSave" name="btnSave" onClick={this.onClick} >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    );
  }
}

export default withApollo(MarkSubjectExam)

