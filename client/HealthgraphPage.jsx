
import React from 'react';
import { ReactMeteorData, useTracker } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { browserHistory } from 'react-router';

import { get, has } from 'lodash';

import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';
import { EJSON } from 'meteor/ejson';

import moment from 'moment';

import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Button from '@material-ui/core/Container';

import HGraph from 'hgraph-react'; // symlinked with 'yarn link' from project root.
import { PageCanvas, StyledCard } from 'material-fhir-ui';


import { 
  AllergyIntolerancesTable, 
  CarePlansTable,
  ConditionsTable, 
  DiagnosticReportsTable,
  ImmunizationsTable, 
  MedicationStatementsTable,
  MedicationOrdersTable,
  ObservationsTable,  
  PatientsTable,
  ProceduresTable,
  DynamicSpacer,
  AllergyIntolerances,
  CarePlans,
  Conditions,
  Immunizations,
  MedicationStatements,
  Observations
} from 'meteor/clinical:hl7-fhir-data-infrastructure';

import { scaleLinear } from 'd3-scale';
import metrics from '../data/metrics.healthrecords.json';

let sampleData = [
  {
    "metric": "totalCholesterol",
    "value": 0,
    "children": [
      {
        "metric": "ldl",
        "value": 100
      },
      {
        "metric": "hdl",
        "value": 50
      },
      {
        "metric": "triglycerides",
        "value": 200
      }
    ]
  },
  {
    "metric": "bloodPressureSystolic",
    "label": "Systolic blood pressure",
    "healthMin": 100,
    "healthMax": 140,
    "absoluteMin": 80,
    "absoluteMax": 200,
    "value": 120
  },
  {
    "metric": "bloodPressureDiastolic",
    "label": "Diastolic blood pressure",
    "healthMin": 60,
    "healthMax": 100,
    "absoluteMin": 0,
    "absoluteMax": 200,
    "value": 80
  },
  {
    "metric": "weight",
    "label": "Body weight Measured",
    "healthMin": 120,
    "healthMax": 200,
    "absoluteMin": 80,
    "absoluteMax": 240,
    "value": 140
  },
  {
    "metric": "pulse",
    "label": "Heart rate",
    "healthMin": 50,
    "healthMax": 80,
    "absoluteMin": 30,
    "absoluteMax": 120,
    "value": 60
  },
  {
    "metric": "bloodOxygenation",
    "label": "Oxygen saturation in Blood",
    "healthMin": 90,
    "healthMax": 100,
    "absoluteMin": 70,
    "absoluteMax": 100,
    "value": 98
  },
  {
    "metric": "temperature",
    "label": "Body temperature",
    "healthMin": 96,
    "healthMax": 99,
    "absoluteMin": 94,
    "absoluteMax": 106,
    "value": 98.6
  },
  // {
  //   "metric": "alcoholUse",
  //   "value": 0
  // },
  // {
  //   "metric": "nicotineUse",
  //   "value": 0
  // },
  // {
  //   "metric": "painLevel",
  //   "value": 0
  // },
  // {
  //   "metric": "waistCircumference",
  //   "value": 0
  // },
  // {
  //   "metric": "exercise",
  //   "value": 0
  // },
  // {
  //   "metric": "sleep",
  //   "value": 0
  // },
  // {
  //   "metric": "happiness",
  //   "value": 0
  // },
  // {
  //   "metric": "glucose",
  //   "value": 0
  // }
];

//==========================================================================================
// Helper Functions

const hGraphConvert = (gender, metric, data) => {
  const metricObj = metrics[gender][metric];
  //const sortedValues = data.values.sort((a, b) => new Date(a.date) - new Date(b.date));

  return {
    label: data.label || metricObj.label,
    // value: sortedValues[sortedValues.length - 1].value,
    // values: sortedValues,
    value: data.value || metricObj.value[0],
    values: data.values,

    healthyMin: data.healthyMin || metricObj.healthyRange[0],
    healthyMax: data.healthyMax || metricObj.healthyRange[1],
    absoluteMin: data.absoluteMin || metricObj.absoluteRange[0],
    absoluteMax: data.absoluteMax || metricObj.absoluteRange[1],
    weight: data.weight || metricObj.weight,
    unitLabel: data.unitLabel || metricObj.unitLabel
  }
}

//==========================================================================================
// Main Component

Session.setDefault('hideToggles', true);
Session.setDefault('systemOfMeasurement', 'imperial');

export class HealthgraphPage extends React.Component {
  constructor(props) {
    super(props);
  }
  calculateScoreFromMetric(metric){
    let scale;
  
    // TODO: Review score calcs
    if (metric.value > metric.healthyMax) {
      // if it's high, healthyMax to absoluteMax, 1 to 0
      scale = scaleLinear()
        .domain([metric.healthyMax, metric.absoluteMax])
        .range([1, 0]);
    } else if (metric.value < metric.healthyMin) {
      // if it's low, healthyMin to absolute Min, 1 to 0
      scale = scaleLinear()
        .domain([metric.healthyMin, metric.absoluteMin])
        .range([1, 0]);
    } else {
      // if it's healthy, perfect score
      return 1;
    }
  
    return scale(metric.value);
  }
  calculateHealthScore(data){
    // TODO: Review score calcs

    let totalWeight = 0;
    data.map(d => {
      totalWeight += d.weight;
    });

    if (totalWeight !== 100) {
      console.log("Total weight of values does not equal 100%");
    }

    let scoreTotal = 0;

    data.map(d => {
      const score = this.calculateScoreFromMetric(d);
      const weightPercentage = d.weight / 100;
      const weightedScore = weightPercentage * score;
      scoreTotal += weightedScore;
    });

  return scoreTotal * 100;
  }
  convertDataSet(data){
    console.log('Converting data set', data)
    return data.map(d => {
      const converted = hGraphConvert('male', d.metric, d);
      converted.id = d.metric;
      if (d.children) {
        converted.children = d.children.map(c => {
          const convertedChild = hGraphConvert('male', c.metric, c);
          convertedChild.parentKey = c.parentKey;
          convertedChild.id = c.metric;
          return convertedChild;
        })
      }
      return converted;
    });
  }
  getMeteorData() {

    let imgHeight = (Session.get('appHeight') - 210) / 3;

    let data = {
      style: {
        page: {},
        coverImg: {
          maxWidth: 'inherit',
          maxHeight: 'inherit',
          height: 'inherit'
        },
        cards: {
          media: {
            height: (imgHeight - 1) + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          practitioners: {
            cursor: 'pointescale-downr',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          organizations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          },
          locations: {
            cursor: 'pointer',
            height: imgHeight + 'px',
            overflowY: 'hidden',
            objectFit: 'cover'
          }
        },
        inactiveIndexCard: {
          opacity: .5,
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px'
        },
        tile: {
          width: '100%',
          display: 'inline-block',
          paddingLeft: '10px',
          paddingRight: '10px',
          paddingBottom: '0px',
          marginBottom: '20px',
          height: imgHeight + 'px'
        },
        spacer: {
          display: 'block'
        },

      },
      ccd: {
        allergyIntolerances: [],
        careplans: [],
        conditions: [],
        diagnosticReports: [],
        immunizations: [],
        medications: [],
        medicationOrders: [],
        medicationStatements: [],
        observations: Observations.find().fetch(),
        patients: [],
        procedures: []
      },
      counts: {
        observationsCount: Observations.find().count()
      },
      minimongo: {
        allergyIntolerances: [],
        careplans: [],
        conditions: [],
        diagnosticReports: [],
        immunizations: [],
        medications: [],
        medicationOrders: [],
        medicationStatements: [],
        observations: [],
        patients: [],
        procedures: []
      },
      query: {},
      hideEnteredInError: Session.get('hideEnteredInError'),
      hidePatientName: Session.get('hidePatientName'),
      hideToggles: Session.get('hideToggles'),
      hideActionIcons: Session.get('hideActionIcons'),
      hideIdentifiers: Session.get('hideIdentifiers'),
      currentYearData: [],
      currentScore: 0
    };


    // update sample dataset
    let components;
    let diastolic;
    let systolic;


    console.log('Parsing sampleData', sampleData);

    let resultingData = [];
    sampleData.forEach(function(datum){
      switch (datum.metric) {
        // case "totalCholesterol":
        //   console.log('Observations.find(cholesterol)', Observations.find().count())
        //   datum.value = 0.5;
        //   datum.weight = 0;
        //   resultingData.push(datum);
        //   break;
        case "bloodPressureSystolic":
          // console.log('Observations.find().bloodPressureSystolic', Observations.find({'component.code.coding.code': '8480-6'}).count())
          let lastSystolicObservation = Observations.find({'code.coding.code': '55284-4'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastSystolicObservation){
            console.log('Most recent systolic BP observation', lastSystolicObservation);
            components = get(lastSystolicObservation, 'component');
            components.forEach(function(component){
              if(get(component, 'code.coding[0].code') === "8480-6"){
                datum.value = get(component, 'valueQuantity.value', 0)
              }
            })
            datum.weight = 10;
            resultingData.push(datum);  
          }
          break;
        case "bloodPressureDiastolic":
          let lastDiastolicObservation = Observations.find({'code.coding.code': '55284-4'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastDiastolicObservation){
            console.log('Most recent diastolic BP observation', lastDiastolicObservation);
            components = get(lastDiastolicObservation, 'component');
            components.forEach(function(component){
              if(get(component, 'code.coding[0].code') === "8462-4"){
                datum.value = get(component, 'valueQuantity.value', 0)
              }
            })
            datum.weight = 10;
            resultingData.push(datum);  
          }
          break;
        case "temperature":
          let lastTemperatureObservation = Observations.find({'code.coding.code': '8310-5'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastTemperatureObservation){
            console.log('Most recent temperature observation', lastTemperatureObservation);
            datum.value = get(lastTemperatureObservation, 'valueQuantity.value');
            datum.weight = 30;
            resultingData.push(datum);  
          }
          break;
        case "pulse":
          let lastPulseObservation = Observations.find({'code.coding.code': '8867-4'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastPulseObservation){
            console.log('Most recent pulse observation', lastPulseObservation);
            datum.value = get(lastPulseObservation, 'valueQuantity.value');
            datum.weight = 10;
            resultingData.push(datum);  
          }
          break;
        case "bloodOxygenation":
          let lastBloodOxygenation = Observations.find({'code.coding.code': '20564-1'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastBloodOxygenation){
            console.log('Most recent blood oxygenation observation', lastBloodOxygenation);
            datum.value = get(lastBloodOxygenation, 'valueQuantity.value');
            datum.weight = 20;
            resultingData.push(datum);  
          }
          break;

        case "waistCircumference":
          let lastWaistCircumference = Observations.find({'code.coding.code': '56115-9'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastWaistCircumference){
            console.log('Most recent waist circumfrence observation', lastWaistCircumference);
            datum.value = get(lastWaistCircumference, 'valueQuantity.value');
            datum.weight = 20;
            resultingData.push(datum);  
          }
        case "weight":
          // console.log('Observations.find(weight)', Observations.find({'code.coding.code': '29463-7'}).count())
          let lastWeightMeasurement = Observations.find({'code.coding.code': '3141-9'}, {sort: {'effectiveDateTime': -1}}).fetch()[0];
          if(lastWeightMeasurement){
            console.log('Most recent weight observation', lastWeightMeasurement);
            datum.value = get(lastWeightMeasurement, 'valueQuantity.value');

            // if(Session.equals('systemOfMeasurement', 'imperial')){
            //   datum.value = datum.value * 2.205;
            // }

            datum.weight = 20;
            resultingData.push(datum);  
          }
          break;
                
        case "alcoholUse":
          // datum.value = 0;
          // datum.weight = 20;
          // resultingData.push(datum);
          break;
        case "nicotineUse":
          // datum.value = 0;
          // datum.weight = 20;
          // resultingData.push(datum);
          break;
        case "painLevel":
          // datum.value = 0;
          // datum.weight = 20;
          // resultingData.push(datum);
          break;
        case "exercise":
          // datum.value = 8;
          // resultingData.push(datum);
          break;
        case "sleep":
          // datum.value = 8;
          // resultingData.push(datum);
          break;
        case "happiness":
          // datum.value = 9;
          // resultingData.push(datum);
          break;
        case "glucose":
          // datum.value = 70;
          // resultingData.push(datum);
          break;
        case "other":
          // datum.value = 0.5;
          // resultingData.push(datum);
          break;
                  
        default:
          break;
      }
    })

    console.log('resultingData', resultingData)

    data.currentYearData = this.convertDataSet(resultingData);
    console.log('data.currentYearData', data.currentYearData)

    data.currentScore = parseInt(this.calculateHealthScore(this.convertDataSet(resultingData)), 10);


    // data.style.indexCard = Glass.darkroom(data.style.indexCard);

    if (Session.get('appWidth') < 768) {
      data.style.inactiveIndexCard.width = '100%';
      data.style.inactiveIndexCard.marginBottom = '10px';
      data.style.inactiveIndexCard.paddingBottom = '10px';
      data.style.inactiveIndexCard.paddingLeft = '0px';
      data.style.inactiveIndexCard.paddingRight = '0px';

      data.style.spacer.display = 'none';
    }

    if(Session.get('appHeight') > 1200){
      data.style.page = {
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'relative'
      }
    }

    //if(Meteor.user()){


      
      if(AllergyIntolerances){
        data.ccd.allergyIntolerances = AllergyIntolerances.find().fetch();
      }
      if(CarePlans){
        data.ccd.carePlans = CarePlans.find().fetch();
      }
      if(Conditions){
        let conditionsQuery = {};
        if(data.query){
          conditionsQuery = data.query;
        }
        if(Session.get('hideEnteredInError')){          
          conditionsQuery.verificationStatus = {$nin: ["entered-in-error"]}  // unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
        }
        data.ccd.conditions = Conditions.find(conditionsQuery).fetch();
      }
      if(DiagnosticReports){
        data.ccd.diagnosticReports = DiagnosticReports.find(data.query).fetch();
      }
      if(Immunizations){
        data.ccd.immunizations = Immunizations.find().fetch();
      }
      if(Medications){
        data.ccd.medications = Medications.find().fetch();
      }
      if(Medications){
        data.ccd.medicationOrders = MedicationOrders.find().fetch();
      }        
      if(MedicationStatements){
        data.ccd.medicationStatements = MedicationStatements.find().fetch();
      }
      if(Patients){
        data.ccd.patients = Patients.find().fetch();
      }
      if(Observations){
        data.ccd.observations = Observations.find().fetch();
      }
      if(Procedures){
        data.ccd.procedures = Procedures.find(data.query).fetch();
      }  
    //}

    console.log("HealthgraphPage[data]", data);
    return data;
  }

  rowClick(){
    console.log('rowClick')
  }
  render() {

    let headerHeight = LayoutHelpers.calcHeaderHeight();
    let formFactor = LayoutHelpers.determineFormFactor(2);

    // small web window
    let graphSize = (window.innerWidth - 172) * 0.5;

    // double card layout (smaller)
    if(window.innerWidth > 768){
      graphSize = (window.innerWidth - 172) * 0.4;
    }

    // iphone & ipad
    if(Meteor.isCordova){
      graphSize = window.innerWidth - 200;
    }

    let themePrimaryColor = get(Meteor, 'settings.public.theme.palette.primaryColor')

    let paddingWidth = 84;
    if(Meteor.isCordova){
      paddingWidth = 20;
    }
    if(window.innerWidth > 768){
      paddingWidth = 104;
    }

    let cardWidth = window.innerWidth - paddingWidth;

    let columnVisibility = {
      sampledData: false,
      codeValue: true
    }

    if(window.innerWidth > 1600){
      columnVisibility.sampledData = true;
    }
    if(Meteor.isCordova){
      columnVisibility.codeValue = false;
    }



    return (
        <PageCanvas id='healthgraphHomepage' headerHeight={headerHeight} paddingLeft={paddingWidth} paddingRight={paddingWidth} >
          <Grid container spacing={3}>
            <Grid item key="1" lg={6} style={{width: '100%', marginBottom: '20px'}}>
              <StyledCard id="healthgraphCard" height='auto' margin={20} width={cardWidth + 'px'}>
                <CardHeader 
                  title="Vitals Summary" 
                  subheader={moment().format("MMM DD YYYY")}
                  style={{fontSize: '100%'}} />
                <CardContent style={{fontSize: '100%', width: '100%'}}>
                  <HGraph
                      data={ this.data.currentYearData }
                      score={ this.data.currentScore }
                      width={ graphSize }
                      height={ graphSize }
                      fontSize={ graphSize < 300 ? 10 : 16 }
                      pointRadius={ graphSize < 300 ? 5 : 10 }
                      scoreFontSize={ graphSize < 300 ? 48 : 96 }
                      healthyRangeFillColor={themePrimaryColor}
                      showScore={true}
                      margin={{ top: 72, right: 72, bottom: 72, left: 72 }}
                    />                
                </CardContent>
              </StyledCard>
            </Grid>
            <Grid item key="2" lg={6} style={{width: '100%'}}>
              <StyledCard height='auto' margin={20} width={cardWidth + 'px'}>
                <CardHeader title="Observations" style={{fontSize: '100%'}} />
                <CardContent style={{fontSize: '100%', width: '100%'}}>
                  <ObservationsTable
                      observations={ this.data.ccd.observations } 
                      hideCodeValue={columnVisibility.codeValue}
                      sampledData={columnVisibility.sampledData}
                      rowsPerPage={10}
                      count={this.data.counts.observationsCount}
                      style={{width: '100%'}}
                      formFactorLayout={formFactor}
                    />         
                </CardContent>
              </StyledCard>
              
            </Grid>
          </Grid>       
        </PageCanvas>
    );
  }




  openLink(url){
    console.log("openLink", url);
    browserHistory.push(url);
  }
}


ReactMixin(HealthgraphPage.prototype, ReactMeteorData);

export default HealthgraphPage;