import React from 'react';
import HealthgraphPage from './client/HealthgraphPage';

import { 
  HealthGraphFooterButtons
} from './client/HealthGraphFooterButtons';


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

let FooterButtons = [{
  pathname: '/healthgraph',
  component: <HealthGraphFooterButtons />
}];


export { SidebarElements, DynamicRoutes, HealthgraphPage, FooterButtons };
