import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppContainer } from "react-hot-loader";
import { ApolloProvider } from "react-apollo";

import { BrowserRouter, Switch, Route } from "react-router-dom";

import { createGraphQLClient } from "../../../createGraphQLClient";
import AcademicExamSettingListPage from "./AcademicExamSettingListPage";
import '../../../css/dark.css';

const graphQLClient = createGraphQLClient();

export default function init() {
  setTimeout(function () {
    ReactDOM.render(
      <ApolloProvider client={graphQLClient}>
        <BrowserRouter>
          <Switch>
            <Route path="/plugins/ems-exam/page/exams"
             component={AcademicExamSettingListPage} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>,
      document.getElementById("mountExamList"));
  }, 100);
}