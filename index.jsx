import React from 'react';
import HealthgraphPage from './client/HealthgraphPage';

import {androidRadioButtonOn} from 'react-icons-kit/ionicons/androidRadioButtonOn'


import { 
  HealthGraphFooterButtons
} from './client/HealthGraphFooterButtons';


var DynamicRoutes = [{
  'name': 'HealthgraphPage',
  'path': '/healthgraph',
  'component': HealthgraphPage
}];

var SidebarWorkflows = [{
  'primaryText': 'Healthgraph',
  'to': '/healthgraph',
  'iconName': 'healthgraph'
}];

let FooterButtons = [{
  pathname: '/healthgraph',
  component: <HealthGraphFooterButtons />
}, {
  pathname: '/',
  component: <HealthGraphFooterButtons />
}];

let MainPage = HealthgraphPage;


export { MainPage, SidebarWorkflows, DynamicRoutes, HealthgraphPage, FooterButtons };
