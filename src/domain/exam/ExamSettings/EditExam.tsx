import * as moment from 'moment';
import * as React from 'react';
import {RouteComponentProps, Link} from 'react-router-dom';
import {graphql, QueryProps, MutationFunc, compose, withApollo} from 'react-apollo';
import * as AddExamMutationGql from './AddExamMutation.graphql';
import {LoadExamSubjQueryCacheForAdmin, AddExamMutation} from '../../types';
// import withExamSubjDataLoader from './withExamSubjDataLoader';
import 'react-datepicker/dist/react-datepicker.css';
import withLoadingHandler from '../withLoadingHandler';
import {UPDATE_EXAM_SETTING, CREATE_FILTER_DATA_CACHE, TYPE_OF_GRADINGS} from '../_queries';
import wsCmsBackendServiceSingletonClient from '../../../wsCmsBackendServiceClient';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import ListGrade from './ListGrade';
import Grading from './Grading';
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
//  semesters: any;
  sections: any;
  submitted: any;
//   noOfExams: number;
  dateofExam: any;
 
  dayValue: any;
  isSubjectSame: any;
  startDate: any;
  gradeType: any;
  selectedGrade: any;
  groupValue: any;
  gradingId: any;
  exObj: any;
  ExObj: any;
  
  branchId: any;
  academicyearId: any;
  departmentId: any;
  examFilterCacheList: any;
  typesOfGradingList: any;
};


export interface EditExamProps extends React.HTMLAttributes<HTMLElement> {
  [data: string]: any;
  user?: any;
  examFilterCacheList?: any;
  typesOfGradingList?: any;
 
  sections?: any;
  exObj?: any;
  ExObj?: any;
  examObj?: any;
}


class SaData {
  id: any;
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
    id: any,
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
    this.id = id;
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


class EditExam<T = {[data: string]: any}> extends React.Component<EditExamProps, any> {
  constructor(props: EditExamProps) {
    super(props);
    this.state = {
      isModalOpen: false,
      user: this.props.user,
      typesOfGradingList: this.props.typesOfGradingList,
      branchId: null,
      academicyearId: null,
      departmentId: null,
      examFilterCacheList: this.props.examFilterCacheList,
      exObj: this.props.data,
      ExObj: this.props.EXObj,
      // activeTab:0,
       batches: this.props.batches,
       sections: this.props.sections,
       subjects: this.props.subjects,
      gradeType: '',
    //   noOfExams: 0,
      selectedGrade: '',
      groupValue: '',
      gradingId: '',
      dayValue: [],
      dateofExam: '',
      isSubjectSame: false,
      examObj: {
        textValueMap: {},
            examName: '',
            examDate: '',
            startTime:'',
            endTime: '',
            gradeType: '',
            exmcountvalues: {},
            total: '',
            passing:'',
            actions: '',
            academicyearId: '',
            subjectId:'',
            departmentId: '',
            batchId: '',
            semester: '',
            sectionId: '',
            branchId:'',
            typeOfGradingId: '',
            countvalue: '',
            groupvalue: ''
      },
        
        examData:{
        batch: {
          id: '',
        },
        semester: "",
        subject: {
          id: '',
        },
        section: {
          id: '',
        },
      },
      branches: [],
      academicYears: [],
      departments: [],
      submitted: false,
    };
    // this.toggleTab = this.toggleTab.bind(this);

    this.registerSocket = this.registerSocket.bind(this);
    this.createDepartments = this.createDepartments.bind(this);
    this.createBatches = this.createBatches.bind(this);
    // this.createSemesters = this.createSemesters.bind(this);
    this.createSubjects = this.createSubjects.bind(this);
    this.createSections = this.createSections.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeGrade = this.handleChangeGrade.bind(this);
    this.createGrid = this.createGrid.bind(this);
    // this.validateDuplicateSubject = this.validateDuplicateSubject.bind(this);
    this.handleStTimeChange = this.handleStTimeChange.bind(this);
    this.handleNdTimeChange = this.handleNdTimeChange.bind(this);
    this.handlePassMarksChange = this.handlePassMarksChange.bind(this);
    this.handleTotalMarksChange = this.handleTotalMarksChange.bind(this);
    this.handleExamDateChange = this.handleExamDateChange.bind(this);
    this.isDatesOverlap = this.isDatesOverlap.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.setSelectedGrade = this.setSelectedGrade.bind(this);
    this.doSave = this.doSave.bind(this);
    this.editInputValue = this.editInputValue.bind(this);

    // this.checkForSelectedGrades = this.checkForSelectedGrades.bind(this);
  }

  async componentDidMount() {
    this.setState({
      exObj: this.props.data,
    });
    await this.registerSocket();
    console.log('check batches:', this.props.batches);
    console.log('test exObj data:', this.state.exObj);
    console.log(' test ExObj data state:', this.state.ExObj);
    console.log(' test ExObj data props:', this.props.ExObj);
    this.editInputValue();
  }

 
  registerSocket() {
    const socket = wsCmsBackendServiceSingletonClient.getInstance();
    

    socket.onmessage = (response: any) => {
        let message = JSON.parse(response.data);
        console.log("MarkSubjectExam. message received from server ::: ", message);
        this.setState({
            branchId: message.selectedBranchId,
            academicyearId: message.selectedAcademicYearId,
            departmentId: message.selectedDepartmentId,
        });
        console.log("MarkSubjectExam. branchId: ",this.state.branchId);
        console.log("MarkSubjectExam. departmentId: ",this.state.departmentId);  
        console.log("MarkSubjectExam. ayId: ",this.state.academicyearId);  
    };

    socket.onopen = () => {
        console.log("MarkSubjectExam. Opening websocekt connection to cmsbackend. User : ",this.state.user.login);
        socket.send(this.state.user.login);
    }

    window.onbeforeunload = () => {
        console.log("MarkSubjectExam. Closing websocket connection with cms backend service");
    }
  }

  // componentDidMounts() {
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
  componentWillReceiveProps() {
    this.setState({
      exObj: this.props.data,
    });
    console.log('check batches:', this.props.batches);
    console.log(' test exObj data:', this.state.exObj);
    console.log(' test ExObj data state:', this.state.ExObj);
    console.log(' test ExObj data props:', this.props.ExObj);
    this.editInputValue();
  }
  async getExamFilterDataCache() {
    const {branchId, academicyearId, departmentId} = this.state;
    console.log('exam branch Id:', branchId);
    const {data} = await this.props.client.query({
      query: CREATE_FILTER_DATA_CACHE,
      variables: {
        branchId:  branchId,
        academicyearId:  academicyearId,
        departmentId:  departmentId,
      },

      fetchPolicy: 'no-cache',
    });
    this.setState({
      examFilterCacheList: data,
    });
  }

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

//   createSemesters(semesters: any) {
//     let semestersOptions = [
//       <option key={0} value="">
//         Select Semester
//       </option>,
//     ];
//     for (let i = 0; i < semesters.length; i++) {
//       let id = semesters[i].description;
//       semestersOptions.push(
//         <option key={id} value={id}>
//           {semesters[i].description}
//         </option>
//       );
//     }
//     return semestersOptions;
//   }

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

    // if (this.state.noOfExams === 0) {
    //   alert('Please select no of exams');
    //   return;
    // }

    if (this.state.departmentId && examData.batch.id && examData.section.id) {
      e.target.querySelector('#detailGridTable').removeAttribute('class');
      let btn = e.target.querySelector("button[type='submit']");
      // btn.setAttribute('disabled', true);
    }
  };

 
  onChange = (e: any) => {
    const {id, name, value} = e.nativeEvent.target;
    const {examData,examObj} = this.state;
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
        //   semester: {
        //     id: '',
        //   },
        },
      });
    } else if (name === 'batch') {
      this.setState({
        examData: {
          ...examData,
          batch: {
            id: value,
          },
          // subject: {
          //   id: '',
          // },
          // section: {
          //   id: '',
          // },
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
            id: value,
          },
        },
      });
     
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
        examObj: {
          ...examObj,
          [name]: value,
        },
        examData:{
          ...examData,
          [name]: value,
        }
      });
    }
    // commonFunctions.restoreTextBoxBorderToNormal(name);
  };
//   validateDuplicateSubject(objId: any) {
//     let currentSub: any = document.querySelector('#' + objId);
//     var isSubjectSame = false;
//     for (let i = 0; i < this.state.noOfExams; i++) {
//       let subOptions: any = document.querySelector('#subject' + i);
//       if (
//         subOptions.id !== currentSub.id &&
//         subOptions.options[subOptions.selectedIndex].value !== '' &&
//         subOptions.options[subOptions.selectedIndex].value ===
//           currentSub.options[currentSub.selectedIndex].value
//       ) {
//         isSubjectSame = true;
//         alert('Subject cannot be same for two exams');
//         break;
//       }
//     }

//     this.setState({
//       isSubjectSame: isSubjectSame,
//     });
//     return isSubjectSame;
//   }

  handleChangeGrade(e: any) {
    this.setState({
      gradeType: e.target.value,
    });
  }

  handleChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examData,examObj} = this.state;
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
    examObj.textValueMap[id] = dayname;
    examObj.examDate[id] = stDate;
    this.setState({examObj: examObj});
  };

  handleStTimeChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examObj} = this.state;
    examObj.startTime[id] = value;
    this.setState({examObj: examObj});
  };

  handleExamDateChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examObj} = this.state;
    examObj.examDate[id] = value;
    this.setState({examObj: examObj});
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
    const {examObj} = this.state;
    examObj.endTime[id] = value;
    this.setState({examObj: examObj});
  };

  handlePassMarksChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examObj} = this.state;
    examObj.passing[id] = value;
    console.log(value + 'new');
    this.setState({examObj: examObj});
  };

  handleTotalMarksChange = (e: any) => {
    const {id, value} = e.nativeEvent.target;
    const {examObj} = this.state;
    examObj.total[id] = value;
    this.setState({examObj: examObj});
  };

  updateExam = async (e: any) => {
    const {examData,examObj, branchId, academicyearId, departmentId} = this.state;
    e.preventDefault();
    const { id } = e.nativeEvent.target;
    // let txtEsNm: any = document.querySelector('#examName');
    // if (txtEsNm.value.trim() === '') {
    //   alert('Please provide an Exam Name');
    //   return;
    // }
    //  let exdt: any = document.querySelector('#examDate' );
    //   // if (
    //   //   // examObj.examDate[exdt.id] === undefined ||
    //   //   examObj.examDate[exdt.id] === null ||
    //   //   examObj.examDate[exdt.id] === ''
    //   // ) {
    //   //   // alert('Please select an Exam Date');
    //   //   return;
    //   // }
    
    
    //   let dt: any = document.querySelector('#startTime' );
    //   if (
    //     examObj.startTime[dt.id] === undefined ||
    //     examObj.startTime[dt.id] === null ||
    //     examObj.startTime[dt.id] === ''
    //   ) {
    //     alert('Please select start time');
    //     return;
    //   }
    
    
    //   let en: any = document.querySelector('#endTime' );
    // //   let dt: any = document.querySelector('#startTime' + i);
    //   if (
    //     examObj.endTime[en.id] === undefined ||
    //     examObj.endTime[en.id] === null ||
    //     examObj.endTime[en.id] === ''
    //   ) {
    //     alert('Please select end time');
    //     return;
    //   }
    //   if (examObj.startTime[dt.id] >= examObj.endTime[en.id]) {
    //     alert('Please enter valid end time');
    //     return;
    //   }
    


    //   let pm: any = document.querySelector('#passing' );
    //   if (
    //     examObj.passing[pm.id] === undefined ||
    //     examObj.passing[pm.id] === null ||
    //     examObj.passing[pm.id] === ''
    //   ) {
    //     alert('Please select passing marks for the listed exam');
    //     return;
    //   }
    

   
    //   let tm: any = document.querySelector('#total' );
    // //   let pm: any = document.querySelector('#passingMarks' + i);
    //   if (
    //     examObj.total[tm.id] === undefined ||
    //     examObj.total[tm.id] === null ||
    //     examObj.total[tm.id] === ''
    //   ) {
    //     alert('Please select total marks for the listed exam');
    //     return;
    //   }
    //   const passMarks = examObj.passing[pm.id];
    //   const totalMarks = examObj.total[tm.id];
    //   if (parseInt(totalMarks, 10) < parseInt(passMarks, 10)) {
    //     alert('Total marks should Greater than passing Marks');
    //     return;
    //   }
    
    this.setState({examObj: examObj});
 
    //   let subOptions: any = document.querySelector('#subject' + x);
          let inputObj = new SaData(
            examObj.id !== null || examObj.id !== undefined || examData.id !== ''
            ? examObj.id
            : null, 
            examObj.examName,
          // txtEsNm.value.trim(),
          moment(examObj.examDate, "YYYY-MM-DD"),
          examObj.startTime,
          examObj.endTime,
          this.state.gradeType,
          examObj.total,
          examObj.passing,
          'ACTIVE',
          academicyearId,
        //   subOptions.options[subOptions.selectedIndex].value,
          examData.subject.id,
          departmentId,
          examData.batch.id,
          examObj.semester,
          examData.section.id,
          branchId,
          (this.state.gradeType === "GRADE") ? this.state.selectedGrade : null,
          examObj.exmcountvalues['countvalue' ],
          (this.state.gradeType === "GRADE") ? this.state.groupValue : null
        );
        console.log("form data : ", examData);
        await this.props.client.mutate({
          mutation: UPDATE_EXAM_SETTING,
          variables: { 
              input: inputObj
          },
        }).then((data: any) => {
          console.log('Update Exam ::::: ', data);
          alert("Exam updated successfully!");
          const sdt = data;
         
          examData.payLoad.push(sdt);
      
          // = data.data.addFeeCategory;
          this.setState({
            examData: examData
          });
          
        }).catch((error: any) => {
          alert("Due to some error Exam could not be updated");
          console.log('there was an error sending the update Exam mutation result', error);
          return Promise.reject(`Could not retrieve update Exam data: ${error}`);
        });
      }
    
  //   this.setState({examData: examData});

  //   console.log('total IDS : ', examData.selectedIds);
  //   let btn: any = document.querySelector('#btnSave');
  //   btn.setAttribute('disabled', true);
  //   const examInput = this.getInput(examObj);
  //   this.doSave(examInput);
    
  //   btn.removeAttribute('disabled');
    
   
   
  // };
  
  async doSave(examInput:any){
    const {examData} = this.state;
    await this.props.client.mutate({
      mutation: UPDATE_EXAM_SETTING,
      variables: { 
          input: examData.payLoad
      },
    })
    .then((data: any) => {
          console.log('Saved Result: ', data.data.updateAcademicExamSetting);
          alert('Exam Updated Succesfully');
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
    const {examData, examFilterCacheList,examObj, departmentId} = this.state;
    const retVal = [];
    // for (let x = 0; x < this.state.noOfExams; x++) {
    //   let v = ary[x];
      retVal.push(
        <tbody>
          <tr id="custom-width-input">
            <td>
            <select name="subject" id="subject" onChange={this.onChange} value={examData.subject.id} className="gf-form-input max-width-22" >
                          { 
                            this.createSubjects( this.state.subjects, departmentId,examData.batch.id )
                          }
                        </select>
            </td>
            <td>
            <input type="date" value={examObj.examDate} id={'examDate' } name="examDate" maxLength={10} onChange={this.onChange} className="gf-form-input max-width-12" />
            </td>

            {/* <td>{examObj.textValueMap['examDate' ]}</td> */}

            <td>
              {' '}
              <input id={'startTime' } type="time" name="startTime" step="2" value={examObj.startTime} onChange={this.onChange} />{' '}
            </td>

            <td>
              {' '}
              <input id={'endTime' } type="time" name="endTime" step="2" value={examObj.endTime} onChange={this.onChange} />{' '}
            </td>

            <td>
              {' '}
              <input id={'passing' } name="passing" value={examObj.passing} onChange={this.onChange} />{' '}
            </td>

            <td>
              {' '}
              <input
                id={'total' }
                name="total"
                value={examObj.total}
                onChange={this.onChange}
              />{' '}
            </td>
          </tr>
        </tbody>
      );
    // }
    return retVal;
  }
  editInputValue(){
const{
  branchId,
  departmentId,
  academicyearId,
  examObj,
  exObj,
  examData,
  
} = this.state;
let exValue: any = '';
exValue = this.props.ExObj;
 console.log(' test ExObj daa:', exValue);
this.setState({
  examObj: {
    ...examObj,
    id: exValue.id,
    examName:exValue.examName,
    semester: exValue.semester,
    examDate:  moment(examObj.examDate, "YYYY-MM-DD"),
    startTime: exValue.startTime,
    endTime:exValue.endTime,
    gradeType:exValue.gradeType,
    total:exValue.total,
    passing:exValue.passing,
    action:exValue.action,
    departmentId: departmentId,
    branchId: branchId,
    batchId: examData.batchId,
    sectionId: examData.sectionId,
    subjectId: examData.subjectId,
    academicyearId: academicyearId,
    countvalue:exValue.countValue,
    groupValue:exValue.groupValue,
  },
});
return;
  }
  // getInput(examObj: any) {
  //   const {branchId, departmentId, academicyearId, examData, } = this.state;
  //   let inputObj = {
  //     id:
  //     examObj.id !== null || examObj.id !== undefined || examData.id !== ''
  //         ? examObj.id
  //         : null, 
      
  //         examName:examObj.examName,
  //         semester: examObj.semester,
  //         examDate: examObj.examDate,
  //         startTime: examObj.startTime,
  //         endTime:examObj.endTime,
  //         gradeType:examObj.gradeType,
  //         total:examObj.total,
  //         passing:examObj.passing,
  //         action:examObj.action,
  //         departmentId: departmentId,
  //         branchId: branchId,
  //         batchId: examData.batch.id,
  //         subjectId: examData.subject.id,
  //         sectionId: examData.section.id,
  //         countvalue:examData.countValue,
  //         groupValue:examData.groupValue,
  //         academicyearId: academicyearId,

  //       };
  //       return inputObj;
  //     }



  
      render() {
        // const {data: {createExamFilterDataCache, refetch}, mutate} = this.props;
        const { examData,examObj, branchId, departmentId, academicyearId, examFilterCacheList, isModalOpen, typesOfGradingList } = this.state;
    
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
                      {/* <th>No of Exams</th> */}
                      <th>Update Exam</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                       <td>
                        <select name="batch" id="batch" onChange={this.onChange} value={examData.batch.id} className="gf-form-input max-width-22" >
                          { 
                            this.createBatches( this.state.batches, departmentId )
                          }
                        </select>
                      </td> 
    
                      <td>
                      <select
                name="semester"
                id="semester"
                onChange={this.onChange}
                value={examObj.semester}
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
                            this.createSections( this.state.sections, examData.batch.id )
                          }
                        </select>
                      </td>
    
                      
                      <td>
                        <button className="btn btn-primary" type="submit" id="btnTakeAtnd" name="btnTakeAtnd" style={{width: '130px'}} > Update Exam </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
    
                
    
                <div className="hide" id="detailGridTable">
                  <div className="tflex bg-heading mt-1 e-flex" id="detailGrid">
                    <h4 className="p-1 py-2 mb-0"> Exam Name:   <input id={'examName' } name="examName" value={examObj.examName} onChange={this.onChange} className="h-input m-1" maxLength={300} /> </h4>
                    <div className="hhflex" />
                  </div>
                  <table className="fwidth">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Date</th>
                        {/* <th>Day</th> */}
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
                      <button className="btn btn-primary border-bottom" id="btnSave" name="btnSave" onClick={this.updateExam} >
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
    
    export default withApollo(EditExam)