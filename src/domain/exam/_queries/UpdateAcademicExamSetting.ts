import gql from 'graphql-tag';

export const UPDATE_EXAM_SETTING = gql`
  mutation updateAcademicExamSetting($input: UpdateAcademicExamSettingInput) {
    updateAcademicExamSetting(input: $input) {
      cmsAcademicExamSettingVo {
        id
        examName
        semester
        startTime
        endTime
        gradeType
        total
        passing
        actions
        countValue
        groupValue
        departmentId
        sectionId
        strexamDate
        examDate
        subjectId
        academicyearId
        batchId
        branchId
      }
    }
  }
`;
