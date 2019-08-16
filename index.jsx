import HelloWorldPage from './client/HelloWorldPage';
import PostcardPage from './client/PostcardPage';
import BodyMassIndexPage from './client/BodyMassIndexPage';

var DynamicRoutes = [{
  'name': 'HelloWorldPage',
  'path': '/healthgraph',
  'component': HelloWorldPage
}, {
  'name': 'BodyMassIndexPage',
  'path': '/body-mass-index',
  'component': BodyMassIndexPage
}];

var SidebarElements = [{
  'primaryText': 'Healthgraph',
  'to': '/healthgraph',
  'href': '/healthgraph'
}, {
  'primaryText': 'Body Mass Calculator',
  'to': '/body-mass-index',
  'href': '/body-mass-index'
}];

export { SidebarElements, DynamicRoutes, SamplePage, PostcardPage, BodyMassIndexPage };
