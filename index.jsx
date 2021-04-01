import React from 'react';
import HealthgraphPage from './client/HealthgraphPage';
import SyntheaAnalysisPage from './client/SyntheaAnalysisPage';



import { 
  HealthGraphFooterButtons,
  TurntableFooterButtons
} from './client/HealthGraphFooterButtons';


var DynamicRoutes = [{
  'name': 'HealthgraphPage',
  'path': '/healthgraph',
  'component': HealthgraphPage
}, {
  'name': 'SyntheaAnalysisPage',
  'path': '/synthea-analysis',
  'component': SyntheaAnalysisPage
}];

var SidebarWorkflows = [{
  'primaryText': 'Healthgraph',
  'to': '/healthgraph',
  'iconName': 'healthgraph'
}, {
  'primaryText': 'Synthea Analysis',
  'to': '/synthea-analysis',
  'href': '/synthea-analysis',
  'iconName': 'addressBook'
}];

let FooterButtons = [{
  pathname: '/healthgraph',
  component: <HealthGraphFooterButtons />
}, {
  pathname: '/',
  component: <HealthGraphFooterButtons />
}];

let MainPage = HealthgraphPage;

export { MainPage, SidebarWorkflows, DynamicRoutes, HealthgraphPage, SyntheaAnalysisPage, FooterButtons };
