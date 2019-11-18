import gql from 'graphql-tag';

export const LOAD_EXAM_DATA_CACHE = gql`
query createExamFilterDataCache($collegeId:String!, $academicYearId:String!){
  createExamFilterDataCache(collegeId:$collegeId, academicYearId:$academicYearId  ) {
   branches{ id,branchName},
   departments{
      id,name, branch{ id }, academicyear{id } },
   batches{ id, batch,department{id}},
   sections{id, section, batch{id}},
subjects{id,subjectType,subjectCode,subjectDesc,department{id}, batch{id}},     semesters{ id, description}
    
}
}

`;
