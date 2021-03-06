Package.describe({
    name: 'symptomatic:hgraph-on-fhir',
    version: '0.3.1',
    summary: 'PatientInsight - Accreditation Utility (Cardiac)',
    git: 'https://github.com/symptomatic/hgraph-on-fhir  ',
    documentation: 'README.md'
});
  
Package.onUse(function(api) {
    api.versionsFrom('1.4');
    
    api.use('meteor@1.9.3');
    api.use('webapp@1.10.0');
    api.use('ddp@1.4.0');
    api.use('livedata@1.0.18');
    api.use('es5-shim@4.8.0');
    api.use('ecmascript@0.15.0');

    api.use('react-meteor-data@2.1.2');
    api.use('session');
    api.use('mongo');
    api.use('http');
    api.use('ejson');
    api.use('random');

    if(Package['clinical:fhir-vault-server']){
        api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
    }
     
    api.use('aldeed:collection2@3.0.0');
    api.use('simple:json-routes@2.1.0');
    api.use('clinical:hl7-fhir-data-infrastructure');


    api.addFiles('lib/Collections.js', ['client', 'server']);
    api.addFiles('lib/Methods.js', ['client', 'server']);
    api.addFiles('server/rest.js', 'server');
    
    api.mainModule('index.jsx', 'client');
});


Npm.depends({
    "moment": "2.20.1",
    "lodash": "4.17.4",
    "react": "16.13.0",
    "react-dom": "16.13.0",
    "simpl-schema": "1.5.3",
    "hgraph-react": "0.1.0", 
    "d3-scale": "3.0.1"
})