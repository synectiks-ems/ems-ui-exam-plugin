const IP = 'localhost';
const graphqlUrl = 'http://' + IP + ':9096';
const loggedInUserUrl = 'http://' + IP + ':3000';
const webSockWithCmsBackendUrl = 'ws://' + IP + ':4000/websocket/tracker/websocket';

export const config = {
  GRAPHQL_URL: graphqlUrl + '/graphql',
  LOGGED_IN_USER_URL: loggedInUserUrl + '/api/user',
  WEB_SOCKET_URL_WITH_CMS_BACKEND: webSockWithCmsBackendUrl,
};
