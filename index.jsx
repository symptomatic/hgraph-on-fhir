import HealthgraphPage from './client/HealthgraphPage';

var DynamicRoutes = [{
  'name': 'HealthgraphPage',
  'path': '/healthgraph',
  'component': HealthgraphPage
}];

var SidebarElements = [{
  'primaryText': 'Healthgraph',
  'to': '/healthgraph',
  'href': '/healthgraph'
}];

export { SidebarElements, DynamicRoutes, HealthgraphPage };
