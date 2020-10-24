import gql from 'graphql-tag';

export const ADD_EXAM_SETTING = gql`
  mutation addAcademicExamSetting($input: [AddAcademicExamSettingInput!]!) {
    addAcademicExamSetting(input: $input) {
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

        departmentId
        sectionId

        subjectId
        academicyearId
        batchId
        branchId
      }
    }
  }
`;
